# 110 Sør-Vest Daily Operations Support System

## Case Title
110 Sør-Vest Daily Operations Support and Bonfire Notification System

## Background
The emergency response center 110 Sør-Vest at Rogaland Brann og Redning IKS currently lacks a centralized system for managing daily operational information and public bonfire notifications. Important daily information such as road closures, scheduled smoke tests, gas facility flaring, and other non-critical but operationally relevant events are currently managed through informal channels without proper structure or overview. Bonfire notifications are registered via Forms on the website, automatically sent to email, and sorted by municipality. When citizens call about suspected fires, operators must spend valuable time searching through email folders to verify if it's a registered bonfire. With more than 25,000 logged incidents annually across 29 municipalities, the center requires a purpose-built support system that doesn't interfere with the critical Locus Emergency Operation system, which runs on a strictly regulated network where API access has been denied by the national operations organization.

## Purpose
Develop a web-based daily operations support system that serves as a digital notice board for operators, consisting of three integrated components:
1. **Daily Information Board** - A system for registering and viewing daily operational information such as road closures, smoke tests, gas flaring, and other non-critical events that operators need to be aware of
2. **Duty Roster Overview** - A weekly overview of key personnel assignments (vakthavende brannsjef, innsatsleder brann, etc.)
3. **Bonfire Notification Map** - A public registration portal (www.rogbr.no) integrated with Google Maps, allowing operators to quickly verify registered bonfires when citizens report suspected fires

This support system operates independently from the critical Locus system and provides operators with essential daily information and situational awareness without impacting emergency operations.

## Target Users
- **Primary Users**: Emergency response operators at 110 Sør-Vest alarm center working on Windows computers with three 49-inch monitors per workstation
- **Secondary Users**: General public registering bonfire notifications via the public website

## Development Methodology

This project will be developed using the **BMad (Make, Break, Analyze, Debug)** methodology with AI-assisted development:

- **Make**: Use Claude Code (AI assistant in VS Code) to generate features, components, and API routes based on specifications
- **Break**: Test generated code to identify issues and edge cases
- **Analyze**: Use AI to explain errors, suggest improvements, and review code quality
- **Debug**: Iterate with AI assistance to fix bugs and optimize performance

The BMad approach accelerates development while maintaining code quality through rapid iteration cycles. Claude Code serves as the primary AI development tool throughout the 6-week timeline.

The project follows the full BMad planning and QA workflow, including PRD documentation, architecture sharding, and QA gate validation for each feature. The methodology ensures traceability and AI-assisted code quality checks through the Test Architect agent.

## AI Integration - Google Maps API as Advanced Technology Tool

As approved for this emergency services project, **Google Maps API** serves as the advanced technology component in place of traditional AI integration:

### Why Google Maps API Qualifies as Advanced Technology
- **Geocoding Intelligence**: Automatically converts freeform addresses to precise coordinates using Google's machine learning models trained on global location data
- **Place Autocomplete**: Predictive address suggestions powered by Google's understanding of Norwegian address patterns and common locations
- **Geospatial Analytics**: Distance calculations, proximity matching, and location clustering algorithms
- **Smart Mapping**: Automatic marker clustering, zoom-level optimization, and performance tuning based on data density

### Technical Implementation
The Google Maps API provides sophisticated geospatial processing that would otherwise require complex custom algorithms:
- Real-time geocoding with 95%+ accuracy for Norwegian addresses
- Intelligent address parsing and validation
- Automatic coordinate generation from natural language input
- Visual representation of geospatial data with interactive features

This API integration delivers measurable value by eliminating manual coordinate entry, reducing registration errors, and enabling rapid location verification during emergency calls.

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2.x (App Router) with TypeScript
- **UI Components**: Tailwind CSS with shadcn/ui component library
- **Maps Integration**: @vis.gl/react-google-maps for Google Maps integration
- **State Management**: React Context API and React Query
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Framework**: Next.js 14.2.x API Routes (TypeScript)
- **Runtime**: Node.js 20 LTS
- **API Design**: RESTful API
- **Real-time Updates**: Server-Sent Events (SSE) with automatic fallback to short polling (5-second interval) if SSE connection fails
- **Authentication**: Google OAuth 2.0 via NextAuth.js v5 (Auth.js) with operator whitelist
- **Database ORM**: Prisma

### Database
- **System**: PostgreSQL 14+
- **Hosting**: Cloud-hosted (Vercel Postgres, Supabase, or Neon) for student project phase, migration to on-premises planned post-deployment
- **Indexing Strategy**:
  - Bonfire notifications: Composite index on (municipality, date, status)
  - Daily information: Index on (date, category)
  - Audit log: Index on (timestamp, table_name)

### Authentication & Authorization
- **Protocol**: OAuth 2.0
- **Provider**: Google OAuth for student project phase (migration to Microsoft Entra ID planned for production)
- **Operator Access**: Whitelist-based (project owner approves Google accounts)
- **Bonfire Registration**: Authenticated via Google OAuth using special registration link
- **Session Strategy**: JWT-based sessions (stateless), 8-hour expiration
- **Token Verification**: Server-side verification using Google public keys
- **Roles**: operator (view and create), administrator (full access including user management)

### Deployment
- **Environment**: Cloud hosting (Vercel primary, alternatives: Railway, Render, Fly.io)
- **Deployment Strategy**: Continuous deployment from Git repository
- **SSL/TLS**: Automatic HTTPS via hosting platform
- **Access**: Internet-accessible with Google OAuth authentication
- **Rationale**: Student project requires deployment without access to on-premises servers during 6-week timeline
- **Migration Path**: System designed for future migration to on-premises Windows Server + IIS when server access is granted
- **Trade-offs Accepted**:
  - Network latency for flash messages (100-500ms vs on-premises)
  - Google OAuth vs Microsoft Entra ID (migration planned)
  - Public bonfire registration requires Google login (vs fully public form)

### External Services
- **Google Maps API**: Geocoding and interactive maps
  - API Key Security: HTTP Referer restrictions and IP restrictions for server-side calls
  - Keys stored in environment variables
  - Usage monitoring to stay within free tier ($200/month credit)
- **Google OAuth**: User authentication for operators and bonfire registration
  - OAuth 2.0 client credentials stored securely in environment variables
  - Whitelist management via application database

### Browser Compatibility
- **Internal System**: Microsoft Edge, Google Chrome (latest 2 versions)
- **Public Portal**: All modern browsers including mobile Safari and Chrome

## Core Functionality

### Must Have (MVP)
- User authentication with Google OAuth (whitelist-based operator access)
- Role-based access control (operator vs administrator)
- Daily information board for registering and viewing operational notices (road closures, smoke tests, gas flaring, etc.)
- Automatic timestamp and author tracking for all entries
- Weekly duty roster overview showing assigned personnel for key positions
- Authenticated bonfire registration form via Google OAuth with special registration link
- Google Maps integration with Places Autocomplete for address entry
- Automatic geocoding of addresses to map coordinates
- Interactive map displaying registered bonfires with markers showing contact details
- Time-based automatic expiration of bonfire notifications (typically same-day events)
- Real-time synchronization of new bonfire registrations to internal map using Server-Sent Events with automatic fallback to polling
- Municipality-based filtering of bonfire notifications
- Search and filter functionality for finding specific bonfire notifications quickly
- Audit logging for all data modifications

### Nice to Have (Optional Extensions)
- Historical archive of past daily information entries
- Email notifications for new bonfire registrations
- Export functionality for reports and statistics (CSV/PDF)
- Advanced map features (heat maps, custom map styling)
- SMS notifications for critical daily information
- Mobile app for operators (future phase)

## Data Requirements

### Users
- `id`: UUID (primary key)
- `email`: String (unique, from Google OAuth)
- `full_name`: String (from Google OAuth)
- `role`: Enum (operator, administrator)
- `whitelisted`: Boolean (operator access control)
- `created_at`: Timestamp
- `last_login`: Timestamp

**Note**: No password storage - authentication handled entirely by Google OAuth

### Daily Information
- `id`: UUID (primary key)
- `title`: String
- `description`: Text
- `category`: Enum (road_closure, smoke_test, gas_flaring, other)
- `date`: Date (indexed)
- `created_by`: UUID (foreign key to Users)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `deleted_by`: UUID (nullable)
- `deleted_at`: Timestamp (nullable)

**Index**: (date, category)

### Duty Roster
- `id`: UUID (primary key)
- `position_name`: String
- `assigned_person`: String
- `week_number`: Integer
- `year`: Integer
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `updated_by`: UUID (foreign key to Users)

### Bonfire Notifications
- `id`: UUID (primary key)
- `name`: String
- `phone`: String
- `email`: String
- `address`: String
- `municipality`: String (indexed)
- `latitude`: Decimal
- `longitude`: Decimal
- `date_from`: Timestamp
- `date_to`: Timestamp
- `description`: Text
- `created_at`: Timestamp (indexed)
- `status`: Enum (active, expired, cancelled)
- `geocoded_at`: Timestamp

**Index**: Composite (municipality, date_from, status)  
**Retention**: Automatically deleted 90 days after expiration

### Audit Log
- `id`: UUID (primary key)
- `action_type`: Enum (create, update, delete)
- `table_name`: String
- `record_id`: UUID
- `old_values`: JSONB
- `new_values`: JSONB
- `user_id`: UUID (foreign key to Users)
- `user_email`: String
- `timestamp`: Timestamp (indexed)

**Index**: (timestamp DESC, table_name)  
**Retention**: 1 year for operational data, 90 days for bonfire data

## User Stories

1. As an operator, I want to register daily information about road closures and scheduled smoke tests, so that all colleagues are aware of non-emergency events
2. As an operator, I want to see who is assigned to key positions this week, so that I know who to contact for specific situations
3. As an operator, I want to quickly view a map of registered bonfires when a citizen calls about smoke, so that I can verify if it's a planned fire without searching through emails
4. As an operator, I want to see contact information for registered bonfires by clicking markers, so that I can quickly call the person if needed
5. As a citizen, I want to register my planned bonfire on a simple website with address autocomplete, so that emergency services are aware of it and won't mistake it for an actual fire
6. As an operator, I want bonfire notifications to automatically expire after the event date, so that the map stays current without manual cleanup
7. As an operator, I want to filter bonfires by municipality, so that I can quickly find relevant notifications for a specific area
8. As an administrator, I want all changes to be logged with full audit trail, so that we maintain accountability and traceability
9. As an operator, I want to receive real-time updates when new bonfires are registered, so I don't need to refresh the page manually
10. As a citizen, I want the address form to suggest complete addresses as I type, so registration is quick and accurate

## Development Timeline (6 Weeks)

### Week 1: Project Foundation & Setup
- Project initialization, repository setup, development environment
- Vercel deployment setup with continuous deployment
- Database schema with Prisma and indexes (cloud-hosted PostgreSQL)
- Google OAuth authentication integration with NextAuth.js
- Operator whitelist management system
- **Milestone**: Authenticated users can log in with whitelisted Google accounts

### Week 2: Daily Information Board & Duty Roster
- Daily information CRUD operations with audit logging
- Category filtering and search functionality
- Duty roster weekly overview with editing
- **Milestone**: Operators can manage daily information and view duty assignments

### Week 3: Bonfire Registration & Google Maps Integration
- Public bonfire registration form with validation
- Google Maps API integration (geocoding, Places Autocomplete)
- Internal map view with markers and info windows
- **Milestone**: Citizens can register bonfires and operators see them on map

### Week 4: Real-time Updates & Advanced Features
- Server-Sent Events implementation optimized for Vercel edge functions
- Automatic fallback to short polling if SSE fails
- Municipality filtering and advanced search
- Automatic expiration system and audit logging
- **Milestone**: System has real-time updates and complete filtering

### Week 5: UI Polish, Testing & Bug Fixes
- UI/UX refinement for 49-inch monitors
- Comprehensive testing (authentication, SSE, maps, RBAC)
- Bug fixes, performance optimization, security review
- **Milestone**: System is stable and ready for deployment

### Week 6: Deployment & Documentation
- Production deployment to Vercel with environment variables configured
- Custom domain configuration (if applicable)
- Operator training and documentation
- Final testing in production cloud environment
- Performance benchmarking (latency, load times)
- **Milestone**: System is live and operators are trained

### Contingency Planning
If timeline pressure emerges, prioritize features in this order:
1. **Critical**: Bonfire notification map (highest value)
2. **High**: Daily information board
3. **Medium**: Duty roster overview (can be simplified if needed)

## Technical Constraints
- System must operate independently from Locus Emergency Operation system (no API integration possible)
- Must support 4-6 concurrent users without performance degradation
- Real-time updates via Server-Sent Events with automatic fallback to short polling (5s) if SSE connection fails
- Desktop-only interface for internal system (optimized for 1/4 of 49-inch monitor display)
- Bonfire registration portal must be responsive and mobile-friendly
- Interface optimized for quarter-screen 49-inch monitor viewport (~1280x1440 or 2560x720)
- Must maintain audit trail for compliance
- Google Maps API with secure key management (HTTP Referer and IP restrictions)
- Google OAuth authentication with whitelist-based access control
- GDPR compliance for citizen personal data
- Data retention: 90 days for bonfires, 1 year for operational data
- SSL/TLS encryption via cloud hosting platform (automatic HTTPS)
- Vercel platform constraints: 10-second serverless function timeout, edge function optimization for SSE

## Security & Compliance

### Authentication & Authorization
- Google OAuth 2.0 (no password storage in application)
- JWT-based sessions with 8-hour expiration
- Server-side token verification using Google public keys
- Whitelist-based operator access (database-driven approval)
- Role-based access control: operator (view/create) vs administrator (full access)
- Bonfire registration requires Google authentication via special link

### Data Protection (GDPR)
- Explicit consent on registration form
- Clear privacy policy
- Automatic deletion after retention period
- Right to deletion via email/phone request
- No third-party data sharing except Google Maps for geocoding

### API Security
- Google Maps API keys with HTTP Referer and IP restrictions
- Separate keys for client-side (maps) and server-side (geocoding)
- Environment variable storage, never in source control
- API key rotation every 90 days

### Application Security
- SQL injection prevention via Prisma ORM
- XSS protection with React and Content Security Policy
- CSRF protection via NextAuth
- HTTPS/TLS encryption (automatic via Vercel)
- Input validation (client and server-side with Zod)
- Rate limiting on bonfire registration (5 submissions per user per hour)
- Whitelist-based access control for operators
- Audit logging of all modifications

## Performance Benchmarks

### Response Time Targets
- Initial page load (internal): < 3 seconds (cloud hosting)
- Bonfire registration form: < 2 seconds
- Map rendering (100 markers): < 2 seconds
- Map rendering (500 markers with clustering): < 3 seconds
- API response time: < 500ms (cloud roundtrip)
- Real-time notification delivery: < 3 seconds (SSE) or < 8 seconds (polling fallback)
- Flash message delivery: < 1 second between operators (acceptable latency trade-off)

### Scalability
- Support 4-6 concurrent operators (typical shift size)
- Handle 100+ daily bonfire registrations
- Store 10,000+ historical bonfire records
- Map performance up to 1,000 active markers with clustering
- Vercel serverless function concurrent execution limits

### Monitoring
- Vercel deployment logs and analytics dashboard
- Database slow query logging (> 500ms)
- Google Maps API usage monitoring
- Application metrics: page load times, API response times, SSE connection stability
- Error tracking (Vercel integrated or Sentry)

## Success Criteria
- Operators can register and view daily information within 30 seconds
- Duty roster provides clear weekly overview
- Citizens can register bonfires via authenticated form with address autocomplete
- Bonfires appear on map within 3-5 seconds (cloud latency acceptable)
- Operators verify fires in under 10 seconds (vs. several minutes with email)
- System reduces bonfire search time by 80%+
- Only whitelisted Google account users can access operator system
- Role-based access enforced (operator vs admin)
- Page load times meet cloud hosting benchmarks
- Real-time updates work reliably with SSE or polling fallback
- Flash messages deliver within 1 second between operators
- Zero security incidents during first 6 months
- 90%+ operator satisfaction after 1 month
- 85%+ bonfire registration completion rate

## Post-Launch Roadmap

### Phase 2 (Months 2-3)
- Flash message system implementation (NEW FEATURE from brainstorming)
- Bilstatus management system (S111/S112 tracking)
- Wall screen application deployment
- Historical archive with advanced search
- Email notifications for new registrations
- Export functionality (CSV/Excel)
- Statistics dashboard

### Phase 3 (Months 4-6)
- Migration to on-premises Windows Server + IIS (when server access granted)
- Migration from Google OAuth to Microsoft Entra ID
- Public bonfire registration (remove authentication requirement)
- Mobile-responsive internal interface
- SMS notifications for critical information
- Advanced map features (heat maps, custom styling)
- Weather data integration for risk assessment

### Future Considerations
- Native mobile app
- Integration with public alert systems
- Automated reporting
- CI/CD automation with GitHub Actions or Azure DevOps
- Direct integration with Locus system (if API access granted)