# School Payment and Dashboard API

A comprehensive REST API for managing school payments and transactions with PhonePe gateway integration.

## 🚀 Features

- **Payment Processing**: PhonePe gateway integration with JWT-signed payloads
- **Transaction Management**: Complete CRUD operations with MongoDB aggregation
- **Webhook Integration**: Real-time payment status updates
- **JWT Authentication**: Secure API endpoints
- **Data Validation**: Comprehensive input validation and error handling
- **Pagination & Sorting**: Optimized data retrieval
- **Audit Logging**: Complete transaction and webhook logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edviron
   MONGODB_URI_TEST=mongodb://localhost:27017/Edviron_test

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d

   # Payment Gateway Configuration
   PG_KEY=edvtest01
   API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0

   # Application Configuration
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   BACKEND_URL=http://localhost:5000

   # School Configuration
   SCHOOL_ID=65b0e6293e9f76a9694d84b4
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📚 API Documentation

### Authentication
All endpoints (except health check) require JWT authentication via Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Payment Management
- **POST /api/payments/create-payment** - Create a new payment
- **POST /api/payments/create-order** - Create a new order
- **POST /api/payments/update-order-status** - Update order status
- **GET /api/payments/school/:schoolId/orders** - Get orders by school

#### Transaction Management
- **GET /api/transactions** - Get all transactions (with pagination & filtering)
- **GET /api/transactions/school/:schoolId** - Get transactions by school
- **GET /api/transactions/transaction-status/:custom_order_id** - Check transaction status
- **GET /api/transactions/stats** - Get transaction statistics

#### Webhook Integration
- **POST /api/webhooks** - Process payment webhooks

#### Health Check
- **GET /** - Server health status

### Query Parameters

#### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

#### Sorting
- `sort` - Field to sort by (createdAt, order_amount, payment_time, status)
- `order` - Sort order (asc, desc)

#### Filtering
- `status` - Filter by payment status
- `gateway` - Filter by payment gateway
- `school_id` - Filter by school ID

### Example API Calls

#### Create Payment
```bash
curl -X POST http://localhost:5000/api/payments/create-payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "order_amount": 1000,
    "student_info": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9999999999"
    }
  }'
```

#### Get Transactions
```bash
curl -X GET "http://localhost:5000/api/transactions?page=1&limit=10&sort=createdAt&order=desc" \
  -H "Authorization: Bearer <token>"
```

#### Webhook Payload Example
```json
{
  "status": 200,
  "order_info": {
    "order_id": "ORD_1234567890_abc123",
    "order_amount": 2000,
    "transaction_amount": 2200,
    "gateway": "PhonePe",
    "bank_reference": "YESBNK222",
    "status": "success",
    "payment_mode": "upi",
    "payemnt_details": "success@ybl",
    "Payment_message": "payment success",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "error_message": "NA"
  }
}
```

## 🗄️ Database Schema

### Order Schema
```javascript
{
  _id: ObjectId,
  school_id: ObjectId (ref: 'School'),
  trustee_id: ObjectId (ref: 'User'),
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: String,
  custom_order_id: String (unique),
  order_amount: Number,
  currency: String (default: 'INR'),
  status: String (enum: ['created', 'processing', 'completed', 'failed'])
}
```

### OrderStatus Schema
```javascript
{
  _id: ObjectId,
  collect_id: ObjectId (ref: 'Order'),
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: String,
  error_message: String,
  payment_time: Date
}
```

## 🔒 Security Features

- JWT-based authentication
- Input validation and sanitization
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Comprehensive error handling

## 📊 Performance Optimizations

- MongoDB indexes on frequently queried fields
- Aggregation pipelines for efficient data joining
- Pagination to limit response sizes
- Connection pooling
- Structured logging for monitoring

## 🚨 Error Handling

The API returns consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message",
      "value": "invalid_value"
    }
  ]
}
```

## 📝 Logging

- **HTTP Requests**: All incoming requests logged
- **Payment Events**: Payment creation and updates logged
- **Webhook Events**: All webhook calls logged with payloads
- **Errors**: Comprehensive error logging with stack traces

## 🔧 Development

### Project Structure
```
Backend/
├── config/          # Database configuration
├── controllers/     # Route handlers
├── middleware/      # Authentication, validation, error handling
├── models/          # MongoDB schemas
├── routes/          # API route definitions
├── tests/           # Test files
├── utils/           # Utility functions
└── logs/            # Application logs
```

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode

## 📞 Support

For issues and questions, please check the logs in the `logs/` directory or contact the development team.