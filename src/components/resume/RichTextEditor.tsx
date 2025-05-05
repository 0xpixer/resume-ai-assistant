'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaMagic } from 'react-icons/fa';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  label?: string;
  aiEnabled?: boolean;
  sectionType?: 'summary' | 'experience' | 'education' | 'skills' | 'general';
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  minHeight = '120px',
  label,
  aiEnabled = true,
  sectionType = 'general'
}) => {
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [isOptimizing, setIsOptimizing] = useState(false);
  const contentEditableRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Initialize content
  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerHTML === "") {
      contentEditableRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle selection changes
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) {
      // No text selection or cursor mode, delay hiding toolbar
      setTimeout(() => {
        // Check if mouse is on toolbar
        if (toolbarRef.current && !toolbarRef.current.contains(document.activeElement)) {
          setShowToolbar(false);
        }
      }, 200);
      return;
    }
    
    // Ensure selected text is in the edit area
    if (contentEditableRef.current && contentEditableRef.current.contains(range.commonAncestorContainer)) {
      setShowToolbar(true);
      
      // Calculate toolbar position, place above selected text
      const rect = range.getBoundingClientRect();
      const editorRect = contentEditableRef.current.getBoundingClientRect();
      
      setToolbarPosition({
        top: rect.top - editorRect.top - 40, // Toolbar height + spacing
        left: rect.left - editorRect.left
      });
    }
  };

  // Handle format commands
  const formatText = (command: string, value: string = '') => {
    // Ensure selected text or cursor position
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    
    // Special handling for bullet list
    if (command === 'insertUnorderedList') {
      // If no text is selected, try selecting current line
      if (range.collapsed && contentEditableRef.current) {
        // Find cursor position
        const node = range.startContainer;
        if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
          // If in text node, select entire paragraph
          range.selectNodeContents(node.parentElement);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      
      // Try inserting HTML directly
      if (range.collapsed) {
        // If still no selection, create a new list
        document.execCommand('insertHTML', false, '<ul><li>&#8203;</li></ul>');
      } else {
        // First get selected text content
        const selectedText = range.toString();
        // If text is selected, split it into multiple lines and convert to list items
        if (selectedText) {
          const lines = selectedText.split('\n').filter(line => line.trim());
          if (lines.length > 0) {
            const listItems = lines.map(line => `<li>${line}</li>`).join('');
            const listHtml = `<ul>${listItems}</ul>`;
            
            // Delete current selection and insert list HTML
            document.execCommand('delete');
            document.execCommand('insertHTML', false, listHtml);
          } else {
            // If no valid line, insert an empty list item
            document.execCommand('delete');
            document.execCommand('insertHTML', false, '<ul><li>&#8203;</li></ul>');
          }
        } else {
          // Regular try using browser commands
          document.execCommand(command, false, value);
        }
      }
    } 
    // Special handling for alignment commands
    else if (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight') {
      // Find current cursor position paragraph or block
      let targetNode = range.commonAncestorContainer;
      
      // If selected text node, get its parent element
      if (targetNode.nodeType === Node.TEXT_NODE && targetNode.parentElement) {
        targetNode = targetNode.parentElement;
      }
      
      // Try finding closest block-level element (paragraph/div etc)
      while (targetNode.nodeType === Node.ELEMENT_NODE && 
            ['P', 'DIV', 'LI', 'UL', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].indexOf(
              (targetNode as Element).tagName
            ) === -1 && 
            targetNode.parentElement) {
        targetNode = targetNode.parentElement;
      }
      
      if (targetNode.nodeType === Node.ELEMENT_NODE) {
        // Directly set style
        const alignment = command === 'justifyLeft' ? 'left' : 
                         command === 'justifyCenter' ? 'center' : 'right';
        (targetNode as HTMLElement).style.textAlign = alignment;
      } else {
        // If no suitable element found, try regular commands
        document.execCommand(command, false, value);
      }
    } else {
      // Other commands execute normally
      document.execCommand(command, false, value);
    }
    
    // Update content to parent component
    if (contentEditableRef.current) {
      onChange(contentEditableRef.current.innerHTML);
    }
  };

  // Handle input changes
  const handleInputChange = () => {
    if (contentEditableRef.current) {
      onChange(contentEditableRef.current.innerHTML);
    }
  };

  // Handle AI optimization
  const handleAIOptimize = async () => {
    if (!contentEditableRef.current) return;
    
    const content = contentEditableRef.current.innerHTML;
    if (!content.trim()) return;
    
    setIsOptimizing(true);
    
    try {
      const response = await fetch('/api/resume/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content, 
          plainText: contentEditableRef.current.innerText,
          sectionType 
        }),
      });
      
      if (!response.ok) {
        throw new Error('AI optimization request failed');
      }
      
      const data = await response.json();
      
      if (data.optimizedContent) {
        contentEditableRef.current.innerHTML = data.optimizedContent;
        onChange(data.optimizedContent);
      }
    } catch (error) {
      console.error('AI optimization error:', error);
      alert('AI optimization failed. Please try again later.');
    } finally {
      setIsOptimizing(false);
    }
  };
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative bg-[#fbfbfb]">
        {/* Floating toolbar */}
        <div
          ref={toolbarRef}
          className={`${showToolbar ? 'opacity-100' : 'opacity-0 pointer-events-none'} absolute bg-[#fbfbfb] shadow-[1px_0_5px_rgba(0,0,0,0.05)] rounded-md p-1 flex items-center space-x-1 transition-opacity z-50`}
          style={{
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
          }}
        >
          <button 
            type="button"
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={() => formatText('bold')}
            title="Bold"
          >
            <FaBold size={14} className="text-[#020202]" />
          </button>
          <button 
            type="button"
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={() => formatText('italic')}
            title="Italic"
          >
            <FaItalic size={14} className="text-[#020202]" />
          </button>
          <button 
            type="button"
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={() => formatText('underline')}
            title="Underline"
          >
            <FaUnderline size={14} className="text-[#020202]" />
          </button>
          <div className="h-full border-r mx-1"></div>
          <button 
            type="button"
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={() => formatText('insertUnorderedList')}
            title="Bullet List"
          >
            <FaListUl size={14} className="text-[#020202]" />
          </button>
          <div className="h-full border-r mx-1"></div>
          <button 
            type="button"
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={() => formatText('justifyLeft')}
            title="Align Left"
          >
            <FaAlignLeft size={14} className="text-[#020202]" />
          </button>
          <button 
            type="button"
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={() => formatText('justifyCenter')}
            title="Align Center"
          >
            <FaAlignCenter size={14} className="text-[#020202]" />
          </button>
          <button 
            type="button"
            className="p-1 hover:bg-gray-100 rounded" 
            onClick={() => formatText('justifyRight')}
            title="Align Right"
          >
            <FaAlignRight size={14} className="text-[#020202]" />
          </button>
          
          {aiEnabled && (
            <>
              <div className="h-full border-r mx-1"></div>
              <button 
                type="button"
                className={`p-1 rounded flex items-center gap-1 ${isOptimizing ? 'text-[#eb3d24] bg-[#ffeeec]' : 'hover:bg-gray-100 text-[#020202]'}`}
                onClick={handleAIOptimize}
                disabled={isOptimizing}
                title="AI Optimize"
              >
                <FaMagic size={14} />
                <span className="text-xs whitespace-nowrap">
                  {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
                </span>
              </button>
            </>
          )}
        </div>
        
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        
        <div
          ref={contentEditableRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          className="w-full p-3 bg-[#fbfbfb] border rounded-md shadow-[1px_0_5px_rgba(0,0,0,0.05)] outline-none leading-relaxed"
          style={{ minHeight }}
          onInput={handleInputChange}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
        ></div>
      </div>
    </div>
  );
};

export default RichTextEditor; 