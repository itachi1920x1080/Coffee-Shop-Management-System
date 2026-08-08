import json
import numpy as np
import face_recognition
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.core.security import create_access_token

router = APIRouter()

@router.post("/register/{user_id}")
async def register_face(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """API សម្រាប់ឱ្យ Admin ចុះឈ្មោះផ្ទៃមុខបុគ្គលិកចូលទៅក្នុងប្រព័ន្ធ"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="រកមិនឃើញបុគ្គលិកនេះទេ (User not found)")

    try:
        # អានរូបភាពដែលបានអាប់ឡូត
        image_content = await file.read()
        import io
        
        # បំប្លែងរូបភាពសម្រាប់ face_recognition
        image = face_recognition.load_image_file(io.BytesIO(image_content))
        face_encodings = face_recognition.face_encodings(image)

        if len(face_encodings) == 0:
            raise HTTPException(status_code=400, detail="រកមិនឃើញផ្ទៃមុខក្នុងរូបភាពនេះទេ (No face detected)")
        if len(face_encodings) > 1:
            raise HTTPException(status_code=400, detail="មានផ្ទៃមុខច្រើនជាងមួយក្នុងរូបភាព (Multiple faces detected)")

        # យក Face Encoding ទី១ (ព្រោះមានមុខតែមួយ) រួចបំប្លែងទៅជា JSON List
        encoding_list = face_encodings[0].tolist()
        user.face_encoding = json.dumps(encoding_list)
        
        db.commit()
        return {"message": "ចុះឈ្មោះផ្ទៃមុខជោគជ័យ! (Face registered successfully)"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"បញ្ហាប្រព័ន្ធ: {str(e)}")


@router.post("/login")
async def login_with_face(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """API សម្រាប់ទទួលរូបភាពពីកាមេរ៉ា ហើយផ្ទៀងផ្ទាត់ដើម្បី Login"""
    
    try:
        image_content = await file.read()
        import io
        
        unknown_image = face_recognition.load_image_file(io.BytesIO(image_content))
        unknown_encodings = face_recognition.face_encodings(unknown_image)

        if len(unknown_encodings) == 0:
            raise HTTPException(status_code=400, detail="មិនមានផ្ទៃមុខទេ (No face detected)")
        
        unknown_encoding = unknown_encodings[0]

        # ទាញយកបុគ្គលិកទាំងអស់ដែលមានចុះឈ្មោះផ្ទៃមុខរួចពី Database
        users_with_faces = db.query(User).filter(User.face_encoding != None).all()

        for user in users_with_faces:
            # បំប្លែង JSON String មកជា Numpy Array វិញ
            known_encoding = np.array(json.loads(user.face_encoding))
            
            # ប្រៀបធៀបផ្ទៃមុខ (tolerance កាន់តែតូច កាន់តែសុក្រឹត, លំនាំដើមគឺ 0.6)
            results = face_recognition.compare_faces([known_encoding], unknown_encoding, tolerance=0.5)
            
            if results[0]:  # ប្រសិនបើត្រូវគ្នា (Match)
                # បង្កើត Token ឱ្យគាត់ Login ចូលប្រព័ន្ធ
                access_token = create_access_token(data={"sub": user.username})
                return {
                    "access_token": access_token, 
                    "token_type": "bearer",
                    "user": {"id": user.id, "username": user.username, "role": user.role}
                }

        # បើរង្វិលជុំចប់ហើយនៅតែមិនត្រូវគ្នា
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="ផ្ទៃមុខមិនត្រឹមត្រូវ ឬមិនទាន់បានចុះឈ្មោះ (Face not recognized)"
        )

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"បញ្ហាប្រព័ន្ធ: {str(e)}")
