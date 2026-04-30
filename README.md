# BuildTrack Pro - Construction Project Management System

A premium web application for real-time construction project tracking with photo updates, progress monitoring, and client access via unique access codes.

## Features

### For Admin (Project Owner)

- **Project Management**: Create, edit, and delete construction projects
- **Access Code System**: Generate unique 8-character access codes for each project
- **Photo Updates**: Upload progress photos with descriptions and work categories
- **Progress Tracking**: Monitor project completion percentage
- **Category Organization**: Organize updates by work type:
  - โครงสร้าง (Structure)
  - งานระบบ (Systems)
  - งานตกแต่ง (Interior Finishing)
- **Admin Dashboard**: Centralized control panel with project overview

### For Clients

- **No Registration Required**: Access projects using unique access codes
- **Project Timeline**: View construction progress with photo galleries
- **Category Breakdown**: See progress by work category
- **Responsive Design**: Access on mobile, tablet, or desktop
- **Real-time Updates**: See latest construction photos and descriptions

## Tech Stack

- **Frontend**: React 19 + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL/TiDB (via Drizzle ORM)
- **Authentication**: Manus OAuth
- **File Storage**: Manus Storage (S3-compatible)
- **Testing**: Vitest

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 10+
- MySQL/TiDB database
- Manus OAuth credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/milkmilkky2003/construction-tracker.git
cd construction-tracker

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
construction-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and tRPC client
│   │   └── App.tsx        # Main app router
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers/           # tRPC routers
│   ├── db.ts              # Database queries
│   ├── storage.ts         # File storage helpers
│   └── _core/             # Core infrastructure
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── storage/               # Storage helpers
```

## Key Pages

### Landing Page (`/`)
- Premium luxury design
- Project overview
- Access code entry modal
- Feature highlights

### Admin Dashboard (`/admin`)
- Project list with quick actions
- Create/edit/delete projects
- View access codes
- Copy code to clipboard

### Admin Project Detail (`/admin/project/:projectId`)
- Project information and dates
- Upload new updates
- View all updates by category
- Delete updates
- Regenerate access code

### Client Project View (`/project/:accessCode`)
- Project information
- Progress bar by category
- Timeline of updates
- Photo gallery
- No authentication required

## API Endpoints

All API endpoints are under `/api/trpc` and use tRPC protocol.

### Admin Procedures (Protected)

- `projects.list` - Get all projects for owner
- `projects.create` - Create new project
- `projects.update` - Update project details
- `projects.delete` - Delete project
- `projects.getDetail` - Get project with updates
- `projects.uploadUpdate` - Upload project update with photos
- `projects.deleteUpdate` - Delete project update
- `projects.regenerateAccessCode` - Generate new access code

### Public Procedures

- `projects.getByAccessCode` - Get project by access code
- `projects.getUpdates` - Get project updates by access code
- `projects.verifyAccessCode` - Verify if access code is valid

## Authentication

- Admin access requires Manus OAuth login
- Only the project owner can manage projects
- Clients access projects using unique access codes (no login required)

## Database Schema

### projects
- `id` - Primary key
- `ownerId` - Owner user ID
- `name` - Project name
- `description` - Project description
- `startDate` - Project start date
- `endDate` - Project end date
- `accessCode` - Unique 8-character access code
- `progressPercentage` - Overall progress (0-100)
- `isActive` - Project status

### project_updates
- `id` - Primary key
- `projectId` - Foreign key to projects
- `category` - Work category (Structure/Systems/Interior Finishing)
- `description` - Update description
- `uploadedAt` - Upload timestamp

### update_images
- `id` - Primary key
- `updateId` - Foreign key to project_updates
- `imageUrl` - URL to stored image
- `imageKey` - Storage key for image

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/routers/projects.test.ts
```

## Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for Render.

Quick deployment steps:
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect GitHub repository
4. Set environment variables
5. Deploy

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL` - Database connection string
- `VITE_APP_ID` - Manus OAuth app ID
- `OWNER_OPEN_ID` - Owner's Manus user ID
- `JWT_SECRET` - Session signing secret

## Performance Optimization

- Images are stored in S3-compatible storage (not database)
- Database queries are optimized with proper indexing
- Frontend uses React Query for efficient data fetching
- Lazy loading for images and components

## Security Features

- Owner-only access enforcement for admin operations
- Unique access codes for client projects
- OAuth-based authentication
- HTTPS enforcement
- SQL injection prevention via Drizzle ORM
- CSRF protection via session cookies

## Accessibility

- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Responsive design for all screen sizes
- Color contrast compliance

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## License

MIT

## Support

For issues or questions:
- Create an issue on GitHub
- Contact the development team

## Roadmap

- [ ] Real-time notifications for clients
- [ ] Advanced analytics and reporting
- [ ] Mobile app (native iOS/Android)
- [ ] Multi-language support
- [ ] Payment integration for premium features
- [ ] Team collaboration features
- [ ] Document management system
- [ ] Budget tracking

---

**BuildTrack Pro** - Track Your Dream Home's Progress
