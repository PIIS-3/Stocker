from passlib.context import CryptContext

# bcrypt como esquema único. `deprecated="auto"` permite migrar a esquemas
# más nuevos en el futuro sin romper contraseñas ya almacenadas.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Devuelve el hash bcrypt de una contraseña en texto plano."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Comprueba que una contraseña en texto plano coincide con su hash."""
    return pwd_context.verify(plain_password, hashed_password)
