from fastapi import FastAPI

app = FastAPI(title="Coffee Shop API")

@app.get("/")
def read_root():
    return {"message":"Coffee Shop AIP Running "}
    