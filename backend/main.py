from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from routers.auth_router import router as auth_router
from routers.student_router import router as student_router
from routers.tutor_router import router as tutor_router
from routers.coordinator_router import router as coordinator_router
from routers.class_offering_router import router as class_offering_router
from routers.admin_router import router as admin_router
from routers.deptchair_router import router as deptchair_router

# Create FastAPI app instance
app = FastAPI(
    title="Tutor Support System API",
    description="MVP Backend for Class Offering, Enrollment, Reports, and Role-Based Actions",
    version="1.0.0"
)

# Enable CORS (Required for React Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # allow all for MVP
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers (Mounted API endpoints)
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(student_router, prefix="/students", tags=["Students"])
app.include_router(tutor_router, prefix="/tutors", tags=["Tutors"])
app.include_router(coordinator_router, prefix="/coordinator", tags=["Coordinator"])
app.include_router(class_offering_router, prefix="/offerings", tags=["Class Offerings"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(deptchair_router, prefix="/dept_chair", tags=["Department Chair"])

# Root endpoint for quick testing
@app.get("/")
def root():
    return {"message": "Tutor Support System Backend Running"}
