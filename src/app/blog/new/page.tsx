'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Underline from '@tiptap/extension-underline';
import { common, createLowlight } from 'lowlight'
import type { EditorView } from 'prosemirror-view';
import {
  Hash,
  Link as LinkIcon,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  X,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Strikethrough,
  Table as TableIcon,
  CheckSquare,
  Highlighter,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline as UnderlineIcon,
} from 'lucide-react';

interface User {
  id: string;
  email?: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
    user_name?: string;
  };
}

// Add Tooltip component
interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

function Tooltip({ children, content }: TooltipProps) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {content}
      </div>
    </div>
  );
}

export default function NewBlogPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');
  const [tags, setTags] = React.useState<string[]>([]);
  const [currentTag, setCurrentTag] = React.useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-purple-500 hover:text-purple-600 underline',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(common),
        HTMLAttributes: {
          class: 'rounded-lg bg-zinc-900 p-4 font-mono text-sm',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Subscript,
      Superscript,
      Underline,
      Placeholder.configure({
        placeholder: 'Write your story...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px]',
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file, view);
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        if (event.clipboardData?.files.length) {
          const file = event.clipboardData.files[0];
          if (file.type.startsWith('image/')) {
            handleImageUpload(file, view);
            return true;
          }
        }
        return false;
      },
    },
  });

  // Check if user is authenticated
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/');
        return;
      }
      setUser(user);
    };

    checkUser();
  }, [supabase, router]);

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = async (file: File, view?: EditorView) => {
    try {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image must be less than 5MB');
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `blog-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath);

      // Insert image in editor
      if (view) {
        const node = view.state.schema.nodes.image.create({ src: publicUrl });
        const transaction = view.state.tr.replaceSelectionWith(node);
        view.dispatch(transaction);
      } else if (editor) {
        editor.chain().focus().setImage({ src: publicUrl }).run();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  const handlePublish = async () => {
    if (!user || !editor) return;

    try {
      setLoading(true);
      setError(null);

      // Validate inputs
      if (!title.trim()) {
        setError('Title is required');
        return;
      }

      if (!editor.getText().trim()) {
        setError('Content is required');
        return;
      }

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Failed to fetch user profile. Please ensure your profile is set up.');
        return;
      }

      if (!profile) {
        // Create profile if it doesn't exist
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
          });

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          setError('Failed to create user profile');
          return;
        }
      }

      // Create blog post
      const { error: insertError } = await supabase
        .from('blogs')
        .insert({
          title,
          content: editor.getHTML(),
          excerpt: editor.getText().slice(0, 200) + '...',
          author_id: user.id,
          tags: tags.length > 0 ? tags : [],
        });

      if (insertError) {
        console.error('Error creating blog post:', insertError);
        setError('Failed to create blog post. Please try again.');
        return;
      }

      // Redirect to blog page
      router.push('/blog');
      router.refresh();
    } catch (error) {
      console.error('Error publishing post:', error);
      setError(error instanceof Error ? error.message : 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 text-red-500 p-4 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {/* Title Input */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-3xl font-semibold bg-transparent focus:outline-none"
        />

        {/* Tags Input */}
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-500/10 text-purple-500 rounded-full text-sm"
            >
              <Hash className="w-3 h-3" />
              <span>{tag}</span>
              <button
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-purple-400"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add tags..."
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1 bg-transparent focus:outline-none text-sm"
          />
        </div>

        {/* Enhanced Editor Toolbar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1">
            <Tooltip content="Heading 1">
              <button
                onClick={() => editor?.chain().focus().setHeading({ level: 1 }).run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('heading', { level: 1 }) ? 'bg-zinc-800' : ''
                }`}
                aria-label="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Heading 2">
              <button
                onClick={() => editor?.chain().focus().setHeading({ level: 2 }).run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('heading', { level: 2 }) ? 'bg-zinc-800' : ''
                }`}
                aria-label="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Heading 3">
              <button
                onClick={() => editor?.chain().focus().setHeading({ level: 3 }).run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('heading', { level: 3 }) ? 'bg-zinc-800' : ''
                }`}
                aria-label="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1">
            <Tooltip content="Bold">
              <button
                onClick={() => editor?.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('bold') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Italic">
              <button
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('italic') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Underline">
              <button
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('underline') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Underline"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Strikethrough">
              <button
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('strike') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1">
            <Tooltip content="Highlight">
              <button
                onClick={() => editor?.chain().focus().toggleHighlight().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('highlight') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Highlight"
              >
                <Highlighter className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Subscript">
              <button
                onClick={() => editor?.chain().focus().toggleSubscript().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('subscript') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Subscript"
              >
                <SubscriptIcon className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Superscript">
              <button
                onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('superscript') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Superscript"
              >
                <SuperscriptIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1">
            <Tooltip content="Align Left">
              <button
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive({ textAlign: 'left' }) ? 'bg-zinc-800' : ''
                }`}
                aria-label="Align left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Align Center">
              <button
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive({ textAlign: 'center' }) ? 'bg-zinc-800' : ''
                }`}
                aria-label="Align center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Align Right">
              <button
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive({ textAlign: 'right' }) ? 'bg-zinc-800' : ''
                }`}
                aria-label="Align right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1">
            <Tooltip content="Bullet List">
              <button
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('bulletList') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Bullet list"
              >
                <List className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Numbered List">
              <button
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('orderedList') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Numbered list"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Task List">
              <button
                onClick={() => editor?.chain().focus().toggleTaskList().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('taskList') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Task list"
              >
                <CheckSquare className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Quote">
              <button
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('blockquote') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Quote"
              >
                <Quote className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1">
            <Tooltip content="Code Block">
              <button
                onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('codeBlock') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Code block"
              >
                <Code className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Add Link">
              <button
                onClick={() => {
                  const url = window.prompt('Enter the URL');
                  if (url) {
                    editor?.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('link') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Add link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Insert Table">
              <button
                onClick={() => {
                  const rows = parseInt(window.prompt('Number of rows', '3') || '3');
                  const cols = parseInt(window.prompt('Number of columns', '3') || '3');
                  editor?.chain().focus().insertTable({ rows, cols }).run();
                }}
                className={`p-2 rounded hover:bg-zinc-800 ${
                  editor?.isActive('table') ? 'bg-zinc-800' : ''
                }`}
                aria-label="Insert table"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-1">
            <Tooltip content="Undo">
              <button
                onClick={() => editor?.chain().focus().undo().run()}
                className="p-2 rounded hover:bg-zinc-800"
                aria-label="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip content="Redo">
              <button
                onClick={() => editor?.chain().focus().redo().run()}
                className="p-2 rounded hover:bg-zinc-800"
                aria-label="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Editor Content */}
        <EditorContent 
          editor={editor} 
          className="min-h-[400px] prose-pre:p-0 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 focus-within:border-purple-500/50 transition-colors"
        />

        {/* Publish Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 text-zinc-400 hover:text-white"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </motion.div>
    </div>
  );
} 