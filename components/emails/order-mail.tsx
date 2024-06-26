import * as React from 'react';
import { Button } from '../ui/button';
import { LucideTextCursor } from 'lucide-react';

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
  <div className='bg-black w-full'>
    <h1 className='text-white'>Welcome, {firstName}!</h1>
    <p className='text-white'>Thanks for ordering with us.</p>
    <div>
      <a href='https://www.modexgaming.nl'>
        <Button className='bg-white text-black border border-white rounded-md'><LucideTextCursor size={20} className='mr-2' />Click me</Button>
      </a>
    </div>
  </div>
);