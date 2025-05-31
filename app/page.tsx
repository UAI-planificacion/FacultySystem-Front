import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Building2, BookOpen, Users, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-border">
        <div className="container mx-auto py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Faculty Management System</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto py-12">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold tracking-tight">
            Comprehensive Faculty Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Efficiently manage your educational institution's faculties, subjects, cost centers, and personnel all in one place.
          </p>
          
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/faculties">
                Get Started
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Faculty Management</h3>
              <p className="text-muted-foreground">
                Create and manage faculties with detailed information and tracking.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Subject Assignment</h3>
              <p className="text-muted-foreground">
                Assign subjects to faculties with student capacity management.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Cost Center Tracking</h3>
              <p className="text-muted-foreground">
                Manage budgets and resources with dedicated cost center assignments.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border border-border flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Personnel Management</h3>
              <p className="text-muted-foreground">
                Assign personnel to faculties with role-based access control.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-border py-6">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Faculty Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}