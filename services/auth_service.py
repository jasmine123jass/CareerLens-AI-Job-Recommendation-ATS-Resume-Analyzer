import base64
import hashlib
import secrets
from jose import JWTError, jwt
from datetime import datetime, timedelta
from app.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

HASH_NAME = "sha256"
ITERATIONS = 120_000
SALT_SIZE = 16


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(SALT_SIZE)
    dk = hashlib.pbkdf2_hmac(HASH_NAME, password.encode("utf-8"), salt, ITERATIONS)
    return base64.b64encode(salt + dk).decode("ascii")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        data = base64.b64decode(hashed.encode("ascii"))
        salt = data[:SALT_SIZE]
        stored = data[SALT_SIZE:]
        computed = hashlib.pbkdf2_hmac(HASH_NAME, plain.encode("utf-8"), salt, ITERATIONS)
        return secrets.compare_digest(stored, computed)
    except (ValueError, TypeError):
        return False

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None