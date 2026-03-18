# 🍽️ Food Delivery Application

Spring Boot REST API with **JWT authentication** backed by **PostgreSQL**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.2.3 |
| Language | Java 17 |
| Security | Spring Security 6 + JWT (jjwt 0.11.5) |
| ORM | Spring Data JPA / Hibernate |
| Database | PostgreSQL 14+ |
| Validation | Jakarta Validation |
| Build Tool | Maven |
| Utilities | Lombok |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+, Maven 3.8+, PostgreSQL 14+

### 1. Create the database
```sql
CREATE DATABASE food_delivery_db;
```

### 2. Configure credentials
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/food_delivery_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run
```bash
mvn spring-boot:run
```
Schema is auto-created from `src/main/resources/schema.sql` on first run.

### 4. Base URL
```
http://localhost:8080/api/v1
```

---

## 🔐 Authentication

All endpoints except `/api/v1/auth/**` require a valid JWT in the `Authorization` header.

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "secret123"
}
```

### Login → receive token
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "secret123"
}
```
Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "john",
  "email": "john@example.com"
}
```

### Use the token on every subsequent request
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

---

## ⚙️ JWT Config
```properties
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration-ms=86400000   # 24 hours
```
> ⚠️ Replace `app.jwt.secret` with a securely generated 256-bit Base64 key in production.

---

## 🔌 API Endpoints

All endpoints require `Authorization: Bearer <token>` except auth routes.

### Auth — `/api/v1/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login, receive JWT |
| POST | `/logout` | Logout (clears context) |

### Customer — `/api/v1/customers`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create customer |
| GET | `/` | Get all customers |
| GET | `/{id}` | Get by ID |
| PUT | `/{id}` | Update customer |
| GET | `/contact/{contact}` | Get by contact |

### Restaurant — `/api/v1/restaurants`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add restaurant |
| GET | `/` | Get all |
| GET | `/{id}` | Get by ID |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |
| GET | `/name/{name}` | Get by name |
| GET | `/location/{location}` | Get by location |
| GET | `/{id}/menu` | Get menu items |
| GET | `/paginated` | Paginated + sorted |

### Menu Items — `/api/v1/menu-items`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add item |
| GET | `/` | Get all |
| GET | `/{id}` | Get by ID |
| PATCH | `/{id}/price` | Update price |
| DELETE | `/{id}` | Delete |
| GET | `/price-greater-than/{value}` | Filter by min price |
| GET | `/name/{name}` | Search by name |

### Orders — `/api/v1/orders`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Place order |
| GET | `/` | Get all |
| GET | `/{id}` | Get by ID |
| GET | `/customer/{customerId}` | Orders by customer |
| PATCH | `/{id}/status` | Update status |
| GET | `/status/{status}` | Filter by status |
| GET | `/date/{date}` | Filter by date (yyyy-MM-dd) |
| GET | `/amount-range?min=&max=` | Filter by amount range |
| GET | `/restaurant/{restaurantId}` | Orders by restaurant |
| PATCH | `/{id}/cancel` | Cancel order |

### Payments — `/api/v1/payments`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/{id}` | Get by ID |
| GET | `/status/{status}` | Filter by status |
| GET | `/method/{method}` | Filter by method |
| PATCH | `/{id}/status` | Update status |

---

## ⚙️ Business Rules

- Customer email & contact must be unique; contact must be exactly 10 digits
- Menu item price cannot be negative; must belong to an existing restaurant
- Unavailable items cannot be ordered
- Order must have at least one item; `totalAmount` auto-calculated
- Orders cancellable only in `PENDING` status
- Payment amount is auto-set to match the order total
