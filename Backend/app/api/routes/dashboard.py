from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.dashboard import DashboardMetricsResponse
from app.crud import crud_dashboard
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/metrics", response_model=DashboardMetricsResponse)
def read_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    ទាញយកទិន្នន័យសង្ខេបសម្រាប់ Dashboard។ 
    ទាមទារឲ្យអ្នកប្រើប្រាស់ Login ជាមុនសិន។
    """
    return crud_dashboard.get_dashboard_metrics(db)
