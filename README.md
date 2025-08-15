# Family Business Management System

A comprehensive Next.js React application designed to centrally manage all aspects of the Tammana family's business operations and personal documentation. The system handles rental property management, insurance policies, government documents, and family member information using local storage.

## Features

- **Family Member Management**: Maintain detailed profiles with photos and personal information
- **Rental Property Management**: Track properties, tenants, rent payments, and maintenance
- **Insurance Management**: Monitor policies, renewals, and premium payments
- **Document Management**: Store and organize important documents digitally
- **Dashboard**: Comprehensive overview with alerts and upcoming deadlines
- **Mobile Responsive**: Optimized for all device sizes

## Technology Stack

- **Frontend**: React 18, Next.js 14, TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **UI Components**: Headless UI
- **Notifications**: React Hot Toast
- **Data Storage**: Browser localStorage with JSON serialization
- **File Storage**: Base64 encoding for documents and images

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── services/           # Business logic and API services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Authentication

The system uses hardcoded family member credentials for authentication:

- **Ravi**: ravi@family.com / ravi123 (Admin)
- **Lakshmi**: lakshmi@family.com / lakshmi123 (Member)
- **Harsha**: harsha@family.com / harsha123 (Admin)
- **Manu**: manu@family.com / manu123 (Member)
- **Nikitha**: nikitha@family.com / nikitha123 (Member)

## Data Storage

All data is stored locally in the browser's localStorage. The system provides:

- Automatic data persistence
- Export functionality (JSON format)
- Import functionality for data restoration
- Data validation and error handling

## Contributing

This is a private family project. For any issues or feature requests, please contact the development team.

## License

Private - All rights reserved by the Tammana family.
