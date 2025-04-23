# Note from the developer

I've done this project since today's afternoon (04/22/25). I used a part of one of my side projects as the auth portion - and I did it because I am proud of the simple way I handled some complex concepts on it, _and I lost some time migrating it from drizzle-orm to prisma 😂_. Some of my highlights on this projects is:

- a proposal for typesafety route paths
- not only a generic application for lendings, but also with some ideas of how handle the process (like the loan needing to be approved before it is more than an loan application)
- the way the application handle different types of users without creating more entities (if you are a person, that's what you are)
- _Something else that I forgot. I got excited and opened the scope of this project a lot as you can see._

Final Note: I really loved to create this project and played a lot with different things. Thank you for the great call and opportunity! I am looking forward to work with you guys!

# Demo available on https://handedruck.vercel.app/

# Handedruck - Loan Management System

A modern, full-stack loan management system built with Next.js 15, TypeScript, and Prisma. The application provides a comprehensive platform for managing loans, borrowers, and payments with separate interfaces for lenders and borrowers.

## Features

- 🔐 Secure Authentication System
- 👥 User Role Management (Admin, Agent, Borrower)
- 💰 Loan Management
  - Loan Applications
  - Loan Approval Workflow
  - Payment Tracking
  - Status Management
- 📊 Dashboard Views
  - Lender Dashboard
  - Borrower Dashboard
- 💳 Payment Processing
- 📱 Responsive UI with Tailwind CSS
- 🎨 Dark/Light Theme Support

## Tech Stack

- **Framework:** Next.js 15 with App Router
- **Language:** TypeScript
- **Database:** Prisma ORM
- **Authentication:** JWT (jose)
- **UI Components:**
  - Radix UI
  - Tailwind CSS
  - Framer Motion
- **Form Handling:** React Hook Form with Zod validation
- **Email:** Resend
- **Development Tools:**
  - ESLint
  - Turbopack

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Database (compatible with Prisma)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/handedruck.git
   cd handedruck
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables in `.env.local`

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
src/
├── actions/        # Server actions
├── app/           # Next.js app router pages
├── components/    # Reusable UI components
├── db/           # Database configuration
├── lib/          # Utility functions
├── types/        # TypeScript type definitions
├── utils/        # Helper functions
└── resend/       # Email templates and configuration
```

## Key Features Explained

### Authentication System

- JWT-based authentication
- Protected routes
- Role-based access control

### Loan Management

- Create and manage loan applications
- Multi-step approval process
- Payment tracking and scheduling
- Status updates and notifications

### User Interface

- Responsive design
- Dark/light theme support
- Interactive dashboards
- Real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment solutions
- The open-source community for the various tools and libraries used in this project
