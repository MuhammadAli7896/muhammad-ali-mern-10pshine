# Production-Grade Logging Guide with Pino

## Overview

This application uses **Pino**, the fastest Node.js logger, for production-grade structured logging. Pino provides:

- **High Performance**: 5x faster than alternatives (Winston, Bunyan)
- **Structured JSON Logging**: Perfect for log aggregation tools (ELK, Datadog, etc.)
- **Automatic Error Serialization**: Stack traces and error details
- **Pretty Output in Development**: Colored, human-readable logs
- **Security**: Automatic filtering of sensitive data

---

## Log Levels

Pino supports 6 log levels (lowest to highest):

| Level | Value | Usage | Example |
|-------|-------|-------|---------|
| `trace` | 10 | Very detailed debugging | Function entry/exit |
| `debug` | 20 | Debugging information | Variable values, logic flow |
| `info` | 30 | General information | Request received, operation completed |
| `warn` | 40 | Warning messages | Deprecated API usage, fallback used |
| `error` | 50 | Error conditions | Caught errors, validation failures |
| `fatal` | 60 | Fatal errors | Database connection failed, app crash |

**Default Levels:**
- Development: `debug` (shows debug, info, warn, error, fatal)
- Production: `info` (shows info, warn, error, fatal)

---

## Usage Examples

### Basic Logging

```javascript
const { logger } = require('./utils/logger');

// Info logging
logger.info('User registration completed');

// With structured data
logger.info({ userId: '123', email: 'user@example.com' }, 'User registered');

// Warning
logger.warn({ oldValue: 'v1', newValue: 'v2' }, 'Configuration changed');

// Error
logger.error({ err: error }, 'Failed to fetch data');

// Fatal (crashes should be rare!)
logger.fatal({ err: error }, 'Database connection failed');
```

### Domain-Specific Helpers

Our logger includes specialized helpers for different operations:

#### 1. **Database Operations**

```javascript
const { logDatabase } = require('./utils/logger');

// Log database operations
logDatabase('query', {
  collection: 'notes',
  operation: 'find',
  filters: { userId: '123' },
  resultCount: 42,
});

logDatabase('insert', {
  collection: 'users',
  documentId: '507f1f77bcf86cd799439011',
});
```

#### 2. **Authentication Events**

```javascript
const { logAuth } = require('./utils/logger');

// Log auth events
logAuth('login-success', { userId: '123', email: 'user@example.com' });
logAuth('login-failed', { email: 'user@example.com', reason: 'Invalid password' });
logAuth('token-refresh', { userId: '123' });
logAuth('logout', { userId: '123' });
```

#### 3. **Email Operations**

```javascript
const { logEmail } = require('./utils/logger');

// Log email sending (when you implement email service)
logEmail('sent', { to: 'user@example.com', subject: 'Welcome' });
logEmail('failed', { to: 'user@example.com', error: 'SMTP connection timeout' });
```

#### 4. **HTTP Requests (Automatic)**

The `requestLoggerMiddleware` automatically logs all HTTP requests:

```javascript
// In server.js (already implemented)
const { requestLoggerMiddleware } = require('./utils/logger');
app.use(requestLoggerMiddleware);

// Logs: 
// - Incoming request: method, path, query, body (filtered)
// - Response: status code, duration in ms
```

### Child Loggers (Advanced)

Create child loggers with additional context:

```javascript
const { createChildLogger } = require('./utils/logger');

// In authentication middleware
const authLogger = createChildLogger({ userId: req.userId, requestId: req.id });
authLogger.info('Token validated');
authLogger.debug({ token: 'details' }, 'Checking token expiry');
```

---

## Security: Sensitive Data Filtering

**Automatically Redacted Fields:**

The logger automatically filters these sensitive fields:

- `password`
- `token`, `refreshToken`, `accessToken`
- `resetPasswordToken`
- `newPassword`, `confirmPassword`, `currentPassword`
- `authorization`, `cookie`

### Example:

```javascript
// Input
logger.info({ 
  email: 'user@example.com', 
  password: 'secret123',
  name: 'John'
}, 'User data');

// Logged output
{
  "level": 30,
  "time": "2026-01-24T10:30:00.000Z",
  "msg": "User data",
  "email": "user@example.com",
  "password": "[REDACTED]",  // ← Automatically filtered!
  "name": "John"
}
```

---

## Environment Configuration

### Environment Variables

Set in `.env`:

```env
# Log level: trace, debug, info, warn, error, fatal
LOG_LEVEL=info

# Node environment
NODE_ENV=production  # or development
```

### NPM Scripts

```bash
# Development with pretty logs (debug level)
npm run dev

# Development with trace-level logging
npm run dev:debug

# Production (JSON logs, info level)
npm run start
# or
npm run prod
```

---

## Output Examples

### Development Mode (Pretty)

```
[10:30:15.123] INFO (12345): Server started on port 5000
    port: 5000
    environment: "development"
    url: "http://localhost:5000"

[10:30:20.456] INFO (12345): POST /api/auth/login
    type: "request"
    method: "POST"
    path: "/api/auth/login"
    body: {
      "email": "user@example.com",
      "password": "[REDACTED]"
    }

[10:30:20.789] INFO (12345): POST /api/auth/login - 200 (333ms)
    type: "response"
    method: "POST"
    path: "/api/auth/login"
    statusCode: 200
    duration: "333ms"
```

### Production Mode (JSON)

```json
{"level":30,"time":"2026-01-24T10:30:15.123Z","msg":"Server started on port 5000","port":5000,"environment":"production","url":"http://localhost:5000"}
{"level":30,"time":"2026-01-24T10:30:20.456Z","msg":"POST /api/auth/login","type":"request","method":"POST","path":"/api/auth/login","body":{"email":"user@example.com","password":"[REDACTED]"}}
{"level":30,"time":"2026-01-24T10:30:20.789Z","msg":"POST /api/auth/login - 200 (333ms)","type":"response","method":"POST","path":"/api/auth/login","statusCode":200,"duration":"333ms"}
```

JSON logs are easily parsed by log aggregation tools like:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **Datadog**
- **Splunk**
- **New Relic**
- **Grafana Loki**

---

## Integration Examples

### In Controllers

```javascript
const { logger, logAuth } = require('../utils/logger');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.debug({ email }, 'Login attempt');
    
    const user = await User.findOne({ email });
    if (!user) {
      logAuth('login-failed', { email, reason: 'User not found' });
      return sendError(res, 401, 'Invalid credentials');
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logAuth('login-failed', { email, reason: 'Invalid password' });
      return sendError(res, 401, 'Invalid credentials');
    }
    
    logAuth('login-success', { userId: user._id, email });
    // ... rest of login logic
    
  } catch (error) {
    logger.error({ err: error }, 'Login error');
    return sendError(res, 500, 'Server error');
  }
};
```

### In Models

```javascript
const { logger } = require('../utils/logger');

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    logger.debug({ userId: this._id }, 'User save - password not modified');
    return next();
  }
  
  logger.debug({ userId: this._id }, 'Hashing password');
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

### In Middleware

```javascript
const { logger, createChildLogger } = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      logger.warn({ path: req.path }, 'No token provided');
      return sendError(res, 401, 'No token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    
    // Create child logger with user context
    req.logger = createChildLogger({ userId: decoded.userId, path: req.path });
    req.logger.debug('User authenticated');
    
    next();
  } catch (error) {
    logger.error({ err: error, path: req.path }, 'Authentication failed');
    return sendError(res, 401, 'Invalid token');
  }
};
```

---

## Best Practices

### ✅ DO

1. **Use structured logging**
   ```javascript
   logger.info({ userId, action: 'delete-note', noteId }, 'Note deleted');
   ```

2. **Log important business events**
   - User registrations
   - Login/logout
   - Data modifications
   - Payment transactions

3. **Use appropriate log levels**
   - `info` for normal operations
   - `warn` for recoverable issues
   - `error` for failures
   - `fatal` only for crashes

4. **Include context**
   ```javascript
   logger.error({ 
     err: error, 
     userId, 
     operation: 'create-note',
     input: noteData 
   }, 'Failed to create note');
   ```

5. **Log performance metrics**
   ```javascript
   const start = Date.now();
   await expensiveOperation();
   logger.info({ duration: Date.now() - start }, 'Operation completed');
   ```

### ❌ DON'T

1. **Don't log sensitive data manually**
   ```javascript
   // BAD
   logger.info(`Password: ${password}`);
   
   // GOOD - automatically filtered
   logger.info({ password }, 'User input received');
   ```

2. **Don't use console.log**
   ```javascript
   // BAD
   console.log('Something happened');
   
   // GOOD
   logger.info('Something happened');
   ```

3. **Don't log in tight loops**
   ```javascript
   // BAD
   users.forEach(user => {
     logger.debug({ user }, 'Processing user');
   });
   
   // GOOD
   logger.info({ userCount: users.length }, 'Processing users batch');
   ```

4. **Don't create multiple logger instances**
   ```javascript
   // BAD
   const logger = pino();
   
   // GOOD
   const { logger } = require('../utils/logger');
   ```

---

## Monitoring & Alerts (Production)

### Log Aggregation

Ship JSON logs to centralized logging:

**With Docker:**
```dockerfile
CMD ["node", "server.js"] | tee /var/log/app.log
```

**With PM2:**
```json
{
  "apps": [{
    "name": "notes-api",
    "script": "server.js",
    "error_file": "/var/log/notes-api-error.log",
    "out_file": "/var/log/notes-api-out.log",
    "log_date_format": "YYYY-MM-DD HH:mm:ss Z"
  }]
}
```

### Alert on Errors

Set up alerts for:
- Error rate > 1% of requests
- Fatal errors (immediate notification)
- Response time > 1000ms
- Failed authentication attempts > 10/minute

---

## Troubleshooting

### Logs not showing?

Check `LOG_LEVEL`:
```bash
LOG_LEVEL=debug npm run dev
```

### Too verbose?

Increase log level:
```env
LOG_LEVEL=warn  # Only warnings and errors
```

### Want JSON in development?

Remove pretty transport:
```javascript
// In logger.js
transport: undefined  // Force JSON output
```

---

## Migration from console.log

All `console.log` statements have been replaced:

| Old | New |
|-----|-----|
| `console.log()` | `logger.info()` |
| `console.error()` | `logger.error({ err })` |
| `console.warn()` | `logger.warn()` |
| `console.debug()` | `logger.debug()` |

---

## Summary

✅ **Implemented**:
- Pino logger with pretty output in dev
- Automatic request/response logging
- Sensitive data filtering (passwords, tokens)
- Structured logging for database, auth, email
- Error serialization with stack traces
- Environment-based configuration

✅ **Benefits**:
- Production-ready structured logs
- Better debugging in development
- Security by default (auto-redaction)
- Performance optimized
- Ready for log aggregation tools

🎯 **Next Steps** (Optional):
- Integrate with Datadog, ELK, or Splunk
- Add request ID tracking (correlation)
- Set up log rotation with `pino-roll`
- Add log-based metrics and alerts
