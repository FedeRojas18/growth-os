import { useState } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Send,
} from 'lucide-react';

export type ActivityType = 'note' | 'call' | 'email' | 'meeting';

interface AddNoteFormProps {
  onSubmit: (type: ActivityType, content: string) => Promise<void>;
  disabled?: boolean;
}

const activityTypes: { type: ActivityType; icon: typeof MessageSquare; label: string }[] = [
  { type: 'note', icon: MessageSquare, label: 'Note' },
  { type: 'call', icon: Phone, label: 'Call' },
  { type: 'email', icon: Mail, label: 'Email' },
  { type: 'meeting', icon: Calendar, label: 'Meeting' },
];

export function AddNoteForm({ onSubmit, disabled }: AddNoteFormProps) {
  const [selectedType, setSelectedType] = useState<ActivityType>('note');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(selectedType, content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const placeholder = {
    note: 'Add a note about this contact...',
    call: 'Log a call summary...',
    email: 'Log an email summary...',
    meeting: 'Log meeting notes...',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Activity type selector */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        {activityTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => setSelectedType(type)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${selectedType === type
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder[selectedType]}
          disabled={disabled || isSubmitting}
          rows={3}
          className="
            w-full px-4 py-3 pr-12
            border border-gray-200 rounded-lg
            text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            disabled:bg-gray-50 disabled:text-gray-500
            resize-none
          "
        />
        <button
          type="submit"
          disabled={!content.trim() || disabled || isSubmitting}
          className="
            absolute right-3 bottom-3
            p-2 rounded-lg
            bg-indigo-600 text-white
            hover:bg-indigo-700
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-colors
          "
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
