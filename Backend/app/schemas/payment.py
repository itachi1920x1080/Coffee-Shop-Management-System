from pydantic import BaseModel, Field
from datetime import datetime

class PaymentCreate(BaseModel):
    order_id: int
    amount_received: float
    # តម្រូវឲ្យប្រើតែពាក្យ USD ឬ KHR ប៉ុណ្ណោះ
    payment_currency: str = Field(default="USD", pattern="^(USD|KHR)$")

class PaymentResponse(BaseModel):
    id: int
    order_id: int
    exchange_rate: float
    amount_received: float
    payment_currency: str
    change_usd: float
    change_khr: float
    created_at: datetime

    class Config:
        from_attributes = True
