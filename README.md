# Note from the developer
- a proposal for typesafety route paths
- not only a generic application for lendings, but also with some ideas of how handle the process (like the loan needing to be approved before it is more than an loan application)
- the way the application handle different types of users without creating more entities (if you are a person, that's what you are)
- _Something else that I forgot. I got excited and opened the scope of this project a lot as you can see._

**Demo available on https://handedruck.vercel.app/**

# Screenshots
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 03 29" src="https://github.com/user-attachments/assets/8e77adf4-3cfb-4a33-b34d-288637065d2c" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 03 58" src="https://github.com/user-attachments/assets/c151c287-cbc5-4d57-8bb4-11783793ec04" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 04 24" src="https://github.com/user-attachments/assets/c74edb05-c3ea-46c5-828f-b8e9c0c66341" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 04 45" src="https://github.com/user-attachments/assets/dd38f560-d298-4257-9d73-521aea89f953" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 05 19" src="https://github.com/user-attachments/assets/29280b35-7d46-410e-a9a6-679c21a6353b" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 05 29" src="https://github.com/user-attachments/assets/bb4768e9-6d6f-46dd-9e17-bdaeff09dc73" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 05 42" src="https://github.com/user-attachments/assets/b80c3e47-ec6d-437f-a920-04b929552c04" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 09 53" src="https://github.com/user-attachments/assets/3f87a332-ae7d-495b-ac2e-8e6a4ea6d3d6" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 06 02" src="https://github.com/user-attachments/assets/52eda160-359d-4e10-ba46-41f2abce8e54" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 06 20" src="https://github.com/user-attachments/assets/f3a9f3b4-aa71-4d20-a098-8a70c27eeb39" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 06 26" src="https://github.com/user-attachments/assets/0936b7c0-b61d-4780-a454-7766187c675a" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 06 46" src="https://github.com/user-attachments/assets/13026ead-98b5-4442-8b3a-483cc53b3eaf" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 06 59" src="https://github.com/user-attachments/assets/6adafd2d-0495-4226-b352-af25d79f6bee" />
<img width="1512" alt="Captura de Tela 2025-04-23 às 12 08 06" src="https://github.com/user-attachments/assets/3c498129-1eab-4e4e-bc10-7e6412b0676e" />

![image](https://github.com/user-attachments/assets/0d96c494-0e74-4425-915f-28078b08fec7)
![image](https://github.com/user-attachments/assets/bdea744f-c1b0-4e23-8c22-f1f2df702862)
![image](https://github.com/user-attachments/assets/6bffef4d-e714-4023-a729-a235fc3ff649)
![image](https://github.com/user-attachments/assets/0c36e1dd-372a-4645-89e0-f102f6863caa)
![image](https://github.com/user-attachments/assets/ae294aba-a7e0-43c4-aa1d-11bd7ab7cecd)
![image](https://github.com/user-attachments/assets/d07610b2-422e-41e2-b663-adf07e9bd369)



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
