from typing import Optional, List
from pydantic import BaseModel, Field

class RegisterRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)
    name: str = Field(..., min_length=1)
    phone: Optional[str] = ""
    goal: Optional[str] = "5K Finisher"
    level: Optional[str] = "Beginner"
    health: Optional[str] = "None"

class LoginRequest(BaseModel):
    email: str
    password: str

class MemberUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    goal: Optional[str] = None
    level: Optional[str] = None
    health: Optional[str] = None

class RunCreate(BaseModel):
    title: str
    date: str
    time: str
    location: str
    distance_km: float = 5.0
    pace_groups: Optional[str] = "5:30/km, 6:30/km, 7:30/km"
    description: Optional[str] = ""
    route_map_url: Optional[str] = ""

class AttendanceToggle(BaseModel):
    user_id: int
    attended: bool

class BatchWhatsAppRequest(BaseModel):
    text: str
