# YT Dubber Frontend

A Next.js application for AI-powered multilingual video dubbing, enabling YouTubers to create multiple language versions of their content.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Development Mode (enables testing without backend)
   NEXT_PUBLIC_DEV_MODE=true
   
   # Backend API Configuration
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Supabase Configuration (optional in dev mode)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

The application uses the following environment variables:

#### Required Variables
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_APP_URL` - Frontend application URL

#### Optional Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_WS_URL` - WebSocket URL for real-time updates
- `NEXT_PUBLIC_DEV_MODE` - Enable development mode (bypasses auth)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe payment integration
- `NEXT_PUBLIC_GA_TRACKING_ID` - Google Analytics tracking

See `.env.local.example` for detailed configuration options.

### Development Mode

When `NEXT_PUBLIC_DEV_MODE=true`, the application:
- Bypasses authentication requirements
- Uses mock data for testing
- Enables development-only features
- Shows configuration status in console

### Configuration Validation

The app automatically validates configuration on startup:
- Checks for required environment variables
- Validates Supabase configuration
- Shows helpful error messages for missing configuration
- Logs configuration status in development mode

## 🏗️ Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   ├── new/page.tsx       # Job creation wizard
│   ├── jobs/              # Job management pages
│   └── auth/              # Authentication pages
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui base components
│   ├── auth/             # Authentication components
│   └── jobs/             # Job management components
├── lib/                  # Utilities and configuration
│   ├── config.ts         # Centralized configuration
│   ├── api.ts            # API client functions
│   ├── supabase.ts       # Supabase client
│   └── auth-context.tsx  # Authentication context
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🎯 Features

### Core Functionality
- **File Upload System** - Drag & drop audio file uploads
- **Language Selection** - Multi-language dubbing support
- **Job Management** - Real-time job status tracking
- **Authentication** - Supabase-powered user management
- **Responsive Design** - Mobile-first UI/UX

### Development Features
- **Configuration Validation** - Automatic env var validation
- **Error Boundaries** - Graceful error handling
- **Toast Notifications** - User feedback system
- **Dev Mode Toggle** - Easy development mode switching
- **TypeScript** - Full type safety

## 🚀 Deployment

### Production Environment

1. **Update environment variables**
   ```env
   NEXT_PUBLIC_DEV_MODE=false
   NEXT_PUBLIC_API_URL=https://api.youtubedubber.com
   NEXT_PUBLIC_APP_URL=https://youtubedubber.com
   NEXT_PUBLIC_SUPABASE_URL=https://your-production-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
   ```

2. **Build the application**
   ```bash
   npm run build
   ```

3. **Start production server**
   ```bash
   npm start
   ```

### Vercel Deployment

1. **Connect to Vercel**
   - Import your repository
   - Set environment variables in Vercel dashboard
   - Deploy automatically

2. **Environment Variables in Vercel**
   - Add all required environment variables
   - Use production URLs for API and app URLs
   - Configure Supabase with production credentials

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript** - Strict type checking enabled
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting (via ESLint)
- **Error Boundaries** - Graceful error handling

### Testing

⚠️ **Important**: Do not run testing commands (`npm test`, `npm run test`) as they cause infinite loops. All development should be done by editing code files directly.

## 🔗 Backend Integration

The frontend is designed to work with the YT Dubber backend API:

### Expected Backend Endpoints
- `POST /api/jobs/upload-urls` - Request signed upload URLs
- `POST /api/jobs` - Create new dubbing job
- `GET /api/jobs/{id}` - Get job status
- `GET /api/jobs/{id}/download` - Download completed files

### API Configuration
The API base URL is configured via `NEXT_PUBLIC_API_URL` environment variable.

## 📚 Documentation

- [Frontend Context](./FRONTEND_CONTEXT.md) - Detailed frontend architecture
- [API Documentation](./lib/api.ts) - API client functions
- [Configuration Guide](./lib/config.ts) - Environment configuration
- [Component Library](./components/) - UI component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the [Frontend Context](./FRONTEND_CONTEXT.md)
- **Issues**: Create an issue in the repository
- **Configuration**: See `.env.local.example` for setup help
