import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  PackagePlus,
  Wallet,
  Rocket,
  CheckCircle2,
  ChevronRight } from
'lucide-react';
export function OnboardingChecklist() {
  const [completedSteps, setCompletedSteps] = useState([1]); // Step 1 completed by default for demo
  const steps = [
  {
    id: 1,
    title: 'Complete Profile',
    description: 'Add your store logo, banner, and business details.',
    icon: User,
    action: 'Edit Profile',
    link: '/settings'
  },
  {
    id: 2,
    title: 'Add First Product',
    description:
    'Create your first listing with images, pricing, and details.',
    icon: PackagePlus,
    action: 'Add Product',
    link: '/products/new'
  },
  {
    id: 3,
    title: 'Set Payout Method',
    description: 'Confirm how you want to receive your earnings.',
    icon: Wallet,
    action: 'Setup Payouts',
    link: '/payouts'
  },
  {
    id: 4,
    title: 'Go Live',
    description: 'Publish your store to the TradeLink marketplace.',
    icon: Rocket,
    action: 'Publish Store',
    link: '/'
  }];

  const progress = completedSteps.length / steps.length * 100;
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">
            Welcome to TradeLink!
          </h1>
          <p className="text-[var(--text-secondary)]">
            Let's get your store set up and ready for customers.
          </p>
        </div>

        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Setup Progress
            </h2>
            <span className="text-sm font-medium text-brand-600">
              {Math.round(progress)}% Completed
            </span>
          </div>
          <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2.5 border border-[var(--border-color)]">
            <div
              className="bg-brand-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`
              }}>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`card p-6 transition-all ${isCompleted ? 'border-success-500/30 bg-success-50/10' : 'hover:border-brand-400'}`}>
                
                <div className="flex items-start sm:items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-500' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'}`}>
                    
                    {isCompleted ?
                    <CheckCircle2 size={24} /> :

                    <step.icon size={24} />
                    }
                  </div>

                  <div className="flex-1">
                    <h3
                      className={`text-lg font-semibold mb-1 ${isCompleted ? 'text-[var(--text-secondary)] line-through' : 'text-[var(--text-primary)]'}`}>
                      
                      {step.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {step.description}
                    </p>
                  </div>

                  <div className="shrink-0 mt-4 sm:mt-0">
                    {isCompleted ?
                    <span className="inline-flex items-center text-sm font-medium text-success-600 bg-success-50 px-3 py-1 rounded-full dark:bg-success-900/20">
                        Completed
                      </span> :

                    <Link
                      to={step.link}
                      className="btn-primary py-1.5 px-4 text-sm">
                      
                        {step.action} <ChevronRight size={16} />
                      </Link>
                    }
                  </div>
                </div>
              </div>);

          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium underline underline-offset-4">
            
            Skip for now and go to Dashboard
          </Link>
        </div>
      </div>
    </div>);

}