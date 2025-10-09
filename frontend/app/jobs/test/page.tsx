'use client';

import React from 'react';
import { useParams } from 'next/navigation';

export default function TestJobPage() {
  const params = useParams();
  const jobId = params.id as string;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-4xl font-bold text-foreground mb-4">
        Test Job Page
      </h1>
      <p className="text-lg text-muted-foreground">
        Job ID: {jobId}
      </p>
      <p className="text-sm text-muted-foreground mt-4">
        If you can see this page, the routing is working!
      </p>
    </div>
  );
}