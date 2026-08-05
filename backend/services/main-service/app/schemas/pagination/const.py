from pydantic import BaseModel


class Pagination(BaseModel):
    page: int
    per_page: int
    last_page: int
    total: int