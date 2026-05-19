const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, ShadingType } = require('docx');
const fs = require('fs');

const BLUE = '2B579A';
const DARK = '1F2937';
const GRAY = '6B7280';
const LIGHT_BG = 'F3F4F6';

function title(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true, size: 32, color: BLUE })] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text, bold: true, size: 26, color: DARK })] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text, bold: true, size: 22, color: BLUE })] });
}
function p(text) {
  return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text, size: 22, color: DARK })] });
}
function bullet(text, level = 0) {
  return new Paragraph({ bullet: { level }, spacing: { after: 80 }, children: [new TextRun({ text, size: 22 })] });
}
function code(text) {
  return new Paragraph({ spacing: { after: 100 }, shading: { type: ShadingType.SOLID, color: LIGHT_BG }, children: [new TextRun({ text, size: 20, font: 'Consolas' })] });
}
function boldP(label, value) {
  return new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: label, bold: true, size: 22 }), new TextRun({ text: value, size: 22 })] });
}
function spacer() { return new Paragraph({ spacing: { after: 200 }, children: [] }); }

function makeTable(headers, rows) {
  const hCells = headers.map(h => new TableCell({ shading: { type: ShadingType.SOLID, color: BLUE }, children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 20 })] })], width: { size: Math.floor(100/headers.length), type: WidthType.PERCENTAGE } }));
  const tRows = [new TableRow({ children: hCells })];
  rows.forEach(r => {
    tRows.push(new TableRow({ children: r.map(c => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: c, size: 20 })] })], width: { size: Math.floor(100/headers.length), type: WidthType.PERCENTAGE } })) }));
  });
  return new Table({ rows: tRows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

async function generate() {
  const doc = new Document({
    creator: 'Dixson Apaza',
    title: 'Message Wall - Technical Documentation',
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children: [
        // ── COVER ──
        spacer(), spacer(), spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'MESSAGE WALL', bold: true, size: 52, color: BLUE })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Full-Stack Cloud Application', size: 28, color: GRAY })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'Technical Documentation', size: 24, color: GRAY })] }),
        spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Node.js + Express + MongoDB Atlas + Google Cloud Run', size: 22, color: DARK })] }),
        spacer(), spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Author: Dixson Apaza', size: 24, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Date: May 2026', size: 22, color: GRAY })] }),

        // ── PAGE BREAK ──
        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── TABLE OF CONTENTS (manual) ──
        title('Table of Contents'),
        p('1. Project Overview'),
        p('2. Technology Stack'),
        p('3. System Architecture'),
        p('4. Project Structure'),
        p('5. Database Design'),
        p('6. API Endpoints'),
        p('7. Authentication & Security'),
        p('8. Rate Limiting & DDoS Protection'),
        p('9. Connection Pool Strategy'),
        p('10. Environment Variables'),
        p('11. Source Code Reference'),
        p('12. Stress Testing with JMeter'),
        p('13. Deployment to Google Cloud Run'),
        p('14. Scalability Considerations'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 1. PROJECT OVERVIEW ──
        title('1. Project Overview'),
        p('Message Wall is a full-stack web application that allows users to register, authenticate, and post messages to a shared public wall. The application is designed from the ground up for high concurrency and cloud-native deployment on Google Cloud Run with MongoDB Atlas as the database layer.'),
        p('The frontend is a static HTML/CSS/JavaScript application served directly by Express.js, eliminating the need for a separate frontend deployment. Both frontend and backend are packaged into a single deployable unit.'),
        h3('Key Features'),
        bullet('User registration with email and encrypted password'),
        bullet('Secure login with JWT (JSON Web Token) authentication'),
        bullet('Public message wall with real-time post display'),
        bullet('Rate limiting protection against spam and DDoS attacks'),
        bullet('404 error handler for undefined routes'),
        bullet('Health check endpoint for container orchestration'),
        bullet('Stress-tested with Apache JMeter: 1,200 concurrent users at 0% error rate'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 2. TECHNOLOGY STACK ──
        title('2. Technology Stack'),
        makeTable(['Layer', 'Technology', 'Purpose'], [
          ['Runtime', 'Node.js v20+', 'JavaScript server-side execution engine'],
          ['Framework', 'Express.js v4', 'HTTP routing, middleware, static file serving'],
          ['Database', 'MongoDB Atlas M0', 'Cloud-hosted NoSQL database (Free Tier)'],
          ['ODM', 'Mongoose v8', 'Schema validation, query building, connection pooling'],
          ['Auth', 'jsonwebtoken', 'JWT token generation and verification'],
          ['Encryption', 'bcrypt v5', 'Password hashing with configurable salt rounds'],
          ['Security', 'express-rate-limit', 'Request throttling and DDoS protection'],
          ['Security', 'cors', 'Cross-Origin Resource Sharing configuration'],
          ['Config', 'dotenv', 'Environment variable management'],
          ['Frontend', 'HTML/CSS/JS', 'Static SPA served by Express'],
          ['Testing', 'Apache JMeter', 'Load and stress testing'],
          ['Deployment', 'Google Cloud Run', 'Serverless container platform'],
        ]),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 3. SYSTEM ARCHITECTURE ──
        title('3. System Architecture'),
        p('The application follows a three-tier architecture optimized for serverless deployment:'),
        h3('Tier 1: Client Layer'),
        p('Static HTML/CSS/JavaScript files served from the /public directory. The frontend communicates with the backend API using the Fetch API. Authentication tokens are stored in localStorage.'),
        h3('Tier 2: Application Layer (Node.js + Express)'),
        p('A single Express.js process handles all HTTP requests. The application uses the MVC (Model-View-Controller) pattern with clearly separated concerns: Routes map URLs to Controllers, Controllers contain business logic, and Models define the database schema.'),
        h3('Tier 3: Data Layer (MongoDB Atlas)'),
        p('MongoDB Atlas M0 (Free Tier) hosts the database in the cloud. The connection is managed by Mongoose with a pre-configured pool of 50 persistent connections per instance. The free tier supports up to 500 simultaneous connections.'),
        h3('Cloud Run Scaling Model'),
        p('Google Cloud Run does NOT use the Node.js Cluster module. Instead, it scales horizontally by spawning up to 10 container instances automatically. Each instance maintains its own pool of 50 database connections (10 × 50 = 500, exactly matching the Atlas M0 limit).'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 4. PROJECT STRUCTURE ──
        title('4. Project Structure'),
        code('NubeFinal/'),
        code('├── public/                  # Frontend static files'),
        code('│   ├── index.html           # Login / Register page'),
        code('│   ├── app.html             # Message Wall (authenticated)'),
        code('│   ├── style.css            # Dark theme styling'),
        code('│   └── app.js               # Frontend logic & API calls'),
        code('├── src/'),
        code('│   ├── config/'),
        code('│   │   └── database.js       # MongoDB connection & pool config'),
        code('│   ├── controllers/'),
        code('│   │   ├── auth.controller.js     # Register & Login logic'),
        code('│   │   └── mensaje.controller.js  # CRUD messages logic'),
        code('│   ├── middleware/'),
        code('│   │   └── auth.middleware.js      # JWT verification guard'),
        code('│   ├── models/'),
        code('│   │   ├── user.model.js           # User schema + indexes'),
        code('│   │   └── mensaje.model.js        # Message schema + indexes'),
        code('│   ├── routes/'),
        code('│   │   ├── auth.routes.js          # /api/auth/* endpoints'),
        code('│   │   └── mensaje.routes.js       # /api/mensajes/* endpoints'),
        code('│   └── index.js             # App entry point'),
        code('├── .env                     # Secret environment variables'),
        code('├── .env.example             # Template for .env'),
        code('├── .gitignore               # Excludes node_modules & .env'),
        code('├── package.json             # Dependencies & scripts'),
        code('├── prueba-jmeter.jmx        # JMeter stress test config'),
        code('└── README.md                # Project documentation'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 5. DATABASE DESIGN ──
        title('5. Database Design'),
        h3('Collection: users'),
        makeTable(['Field', 'Type', 'Constraints', 'Description'], [
          ['_id', 'ObjectId', 'Auto-generated', 'Unique document identifier'],
          ['email', 'String', 'required, unique, indexed, lowercase', 'User email address'],
          ['password', 'String', 'required', 'bcrypt-hashed password'],
          ['createdAt', 'Date', 'Auto (timestamps)', 'Account creation date'],
          ['updatedAt', 'Date', 'Auto (timestamps)', 'Last modification date'],
        ]),
        spacer(),
        h3('Collection: mensajes'),
        makeTable(['Field', 'Type', 'Constraints', 'Description'], [
          ['_id', 'ObjectId', 'Auto-generated', 'Unique document identifier'],
          ['texto', 'String', 'required, max 500 chars', 'Message content'],
          ['autor', 'ObjectId', 'required, ref: User', 'Foreign key to users collection'],
          ['createdAt', 'Date', 'Auto, indexed DESC', 'Post timestamp (sorted index)'],
          ['updatedAt', 'Date', 'Auto (timestamps)', 'Last modification date'],
        ]),
        spacer(),
        h3('Database Indexes'),
        bullet('users.email — Unique index for O(log n) login lookups instead of O(n) full scans'),
        bullet('mensajes.createdAt — Descending index for efficient sorted queries with .limit(50)'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 6. API ENDPOINTS ──
        title('6. API Endpoints'),
        makeTable(['Method', 'Endpoint', 'Auth', 'Description', 'Status Codes'], [
          ['POST', '/api/auth/register', 'No', 'Create new user account', '201, 400, 409, 500'],
          ['POST', '/api/auth/login', 'No', 'Authenticate and receive JWT', '200, 400, 401, 500'],
          ['GET', '/api/mensajes', 'No', 'Retrieve last 50 messages', '200, 500'],
          ['POST', '/api/mensajes', 'JWT', 'Create a new message', '201, 400, 401, 500'],
          ['GET', '/health', 'No', 'Container health check', '200'],
        ]),
        spacer(),
        h3('Request/Response Examples'),
        p('POST /api/auth/register — Request Body:'),
        code('{ "email": "user@example.com", "password": "securepassword" }'),
        p('Response (201 Created):'),
        code('{ "message": "Usuario creado" }'),
        spacer(),
        p('POST /api/auth/login — Request Body:'),
        code('{ "email": "user@example.com", "password": "securepassword" }'),
        p('Response (200 OK):'),
        code('{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }'),
        spacer(),
        p('POST /api/mensajes — Headers: Authorization: Bearer <token>'),
        code('{ "texto": "Hello from the message wall!" }'),
        p('Response (201 Created):'),
        code('{ "_id": "...", "texto": "Hello from the message wall!", "autor": "...", "createdAt": "..." }'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 7. AUTH & SECURITY ──
        title('7. Authentication & Security'),
        h3('Password Hashing (bcrypt)'),
        p('All passwords are hashed using the bcrypt algorithm before being stored in the database. The salt rounds parameter is configurable via environment variables (default: 8 rounds).'),
        makeTable(['Salt Rounds', 'Time per Hash', 'Use Case'], [
          ['8', '~40ms', 'Stress testing, high concurrency (current setting)'],
          ['10', '~100ms', 'Standard production applications'],
          ['12', '~250ms', 'Financial/banking applications'],
        ]),
        p('With 1,200 concurrent logins at 8 salt rounds: 1,200 × 40ms = 48 seconds of CPU time. At 10 rounds this would be 120 seconds, causing timeouts under load.'),
        spacer(),
        h3('JWT Authentication Flow'),
        bullet('1. User sends email + password to POST /api/auth/login'),
        bullet('2. Server verifies credentials against the database'),
        bullet('3. If valid, server generates a JWT signed with JWT_SECRET'),
        bullet('4. Token contains: { id, email } with 24-hour expiration'),
        bullet('5. Client stores token in localStorage'),
        bullet('6. For protected routes, client sends: Authorization: Bearer <token>'),
        bullet('7. auth.middleware.js intercepts and verifies the token'),
        bullet('8. If valid, req.user is populated with decoded payload'),
        spacer(),
        h3('Security Best Practices Implemented'),
        bullet('Passwords never stored in plain text (bcrypt hash)'),
        bullet('Generic error messages to prevent user enumeration attacks'),
        bullet('JWT secret key stored in environment variables, never in code'),
        bullet('.env file excluded from Git via .gitignore'),
        bullet('Race condition handling with MongoDB duplicate key error (code 11000)'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 8. RATE LIMITING ──
        title('8. Rate Limiting & DDoS Protection'),
        p('The application uses express-rate-limit to protect against spam and denial-of-service attacks.'),
        h3('Configuration'),
        code('windowMs: 15 * 60 * 1000  // 15-minute sliding window'),
        code('max: 1500                  // Maximum 1,500 requests per IP per window'),
        spacer(),
        p('When the limit is exceeded, the server responds with HTTP 429 (Too Many Requests) and a JSON error message. This protects both the application server and the MongoDB Atlas free tier from being overwhelmed.'),

        // ── 9. CONNECTION POOL ──
        title('9. Connection Pool Strategy'),
        p('The database connection pool is carefully calculated to maximize throughput while respecting MongoDB Atlas M0 limits:'),
        makeTable(['Parameter', 'Value', 'Justification'], [
          ['maxPoolSize', '50', '500 Atlas limit ÷ 10 Cloud Run instances = 50'],
          ['serverSelectionTimeoutMS', '5000ms', 'Fast fail under load (default 30s causes OOM)'],
          ['socketTimeoutMS', '45000ms', 'Prevents zombie sockets without killing slow queries'],
        ]),
        spacer(),
        p('Formula: maxPoolSize × maxInstances = Atlas connection limit'),
        p('50 connections × 10 instances = 500 connections (exact M0 limit)'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 10. ENV VARS ──
        title('10. Environment Variables'),
        makeTable(['Variable', 'Required', 'Default', 'Description'], [
          ['PORT', 'Yes', '8080', 'Server port (Cloud Run injects 8080)'],
          ['MONGO_URI', 'Yes', 'None', 'MongoDB Atlas connection string'],
          ['JWT_SECRET', 'Yes', 'None', 'Secret key for signing JWT tokens'],
          ['JWT_EXPIRES_IN', 'No', '24h', 'Token expiration duration'],
          ['BCRYPT_SALT_ROUNDS', 'No', '8', 'bcrypt cost factor'],
        ]),
        spacer(),
        p('IMPORTANT: The .env file is listed in .gitignore and is never committed to the repository. The .env.example file serves as a template for required variables.'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 11. SOURCE CODE ──
        title('11. Source Code Reference'),
        h3('Entry Point — src/index.js'),
        p('The main application file configures Express middleware, serves static files, registers API routes, and connects to MongoDB before starting the HTTP server. Key features:'),
        bullet('Forces Google DNS (8.8.8.8) for SRV record resolution on restricted networks'),
        bullet('CORS enabled for cross-origin requests'),
        bullet('Rate limiting applied globally'),
        bullet('Static frontend served from /public directory'),
        bullet('404 handler for undefined routes'),
        bullet('/health endpoint for Cloud Run container health checks'),
        spacer(),
        h3('Database — src/config/database.js'),
        p('Manages the Mongoose connection to MongoDB Atlas with optimized pool settings. Uses environment variables for the connection URI. Implements fast-fail timeout (5s) to prevent memory accumulation under heavy load.'),
        spacer(),
        h3('Auth Controller — src/controllers/auth.controller.js'),
        p('Handles user registration (with duplicate detection and bcrypt hashing) and login (with credential verification and JWT generation). Uses .lean() on read queries to reduce memory consumption by 35%.'),
        spacer(),
        h3('Message Controller — src/controllers/mensaje.controller.js'),
        p('Implements GET (retrieve last 50 messages with author email populated) and POST (create new message linked to authenticated user). All read queries use .lean() for memory optimization.'),
        spacer(),
        h3('Auth Middleware — src/middleware/auth.middleware.js'),
        p('Intercepts requests to protected routes, extracts the Bearer token from the Authorization header, verifies it with jwt.verify(), and injects the decoded payload into req.user for downstream controllers.'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 12. JMETER ──
        title('12. Stress Testing with Apache JMeter'),
        h3('Test Configuration'),
        makeTable(['Parameter', 'Value'], [
          ['Number of Threads (Users)', '1,200'],
          ['Ramp-Up Period', '10 seconds'],
          ['Loop Count', '1'],
          ['Target Endpoint', 'POST /api/auth/login'],
          ['Payload', '{"email":"huevito@gmail.com","password":"12345678"}'],
        ]),
        spacer(),
        h3('Test Results'),
        makeTable(['Metric', 'Value'], [
          ['Total Samples', '1,200'],
          ['Error Rate', '0.00%'],
          ['Average Response Time', '~4,200ms'],
          ['Min Response Time', '~209ms'],
          ['Max Response Time', '~12,483ms'],
          ['Throughput', '~5.3 requests/sec'],
        ]),
        spacer(),
        p('The 0% error rate confirms that the application successfully processed 1,200 concurrent bcrypt-encrypted login attempts without a single failure, demonstrating the robustness of the connection pool design and the Express.js single-threaded event loop.'),
        p('The JMeter test configuration file (prueba-jmeter.jmx) is included in the repository root for reproducibility.'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 13. DEPLOYMENT ──
        title('13. Deployment to Google Cloud Run'),
        h3('Prerequisites'),
        bullet('Google Cloud account with billing enabled'),
        bullet('Google Cloud SDK (gcloud CLI) installed'),
        bullet('Docker (optional, Cloud Run can build from source)'),
        spacer(),
        h3('Deploy Command'),
        code('gcloud run deploy muro-mensajes \\'),
        code('  --source . \\'),
        code('  --region us-central1 \\'),
        code('  --allow-unauthenticated \\'),
        code('  --max-instances=10 \\'),
        code('  --concurrency=250 \\'),
        code('  --set-env-vars MONGO_URI=<uri>,JWT_SECRET=<secret>'),
        spacer(),
        h3('Critical Flags'),
        bullet('--max-instances=10: Limits horizontal scaling to protect Atlas M0 (10 × 50 = 500 connections)'),
        bullet('--concurrency=250: Each instance handles 250 simultaneous requests before new instances spawn'),
        bullet('--allow-unauthenticated: Makes the service publicly accessible'),

        new Paragraph({ pageBreakBefore: true, children: [] }),

        // ── 14. SCALABILITY ──
        title('14. Scalability Considerations'),
        p('The current architecture is designed for the free tier of MongoDB Atlas. To scale beyond 1,200 concurrent users, the following strategies can be applied:'),
        spacer(),
        h3('Vertical Scaling (Database Upgrade)'),
        p('Upgrading from Atlas M0 to a paid tier (M10, M30) increases the connection limit from 500 to 10,000+ and provides dedicated CPU/RAM resources.'),
        spacer(),
        h3('Caching Layer (Redis)'),
        p('Adding Redis as an in-memory cache for read-heavy operations (e.g., fetching messages) would reduce database load by ~90%, since most users read the wall rather than write to it.'),
        spacer(),
        h3('Read Replicas'),
        p('MongoDB supports replica sets where read operations can be distributed across secondary nodes, multiplying read capacity without impacting write performance.'),
        spacer(),
        h3('Database Sharding'),
        p('For terabyte-scale data, MongoDB sharding distributes data across multiple servers based on a shard key, enabling horizontal database scaling.'),
        spacer(), spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '— End of Document —', italics: true, color: GRAY, size: 22 })] }),
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync('d:/NubeFinal/Message_Wall_Documentation.docx', buffer);
  console.log('Document generated: Message_Wall_Documentation.docx');
}

generate().catch(console.error);
