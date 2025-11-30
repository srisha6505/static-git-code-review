/**
 * File tree component for displaying repository structure.
 * @module components/features/repository/FileTree
 */

import React, { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { FileNode } from '../../../types';
import { buildTree, TreeNode } from '../../../lib/fileTree';

/**
 * FileTreeItem component props.
 */
interface FileTreeItemProps {
  /** Name of the file or folder */
  name: string;
  /** Tree node data */
  item: TreeNode;
  /** Current depth level in the tree (for indentation) */
  depth: number;
}

/**
 * Recursive tree item component for rendering file/folder nodes.
 * Handles expand/collapse for folders and links for files.
 * 
 * @param props.name - Display name of the item
 * @param props.item - TreeNode with children and optional file data
 * @param props.depth - Current nesting depth for indentation
 */
const FileTreeItem: React.FC<FileTreeItemProps> = ({ name, item, depth }) => {
  const [isOpen, setIsOpen] = useState(depth < 2); // Auto expand top levels
  const isFolder = item.children && Object.keys(item.children).length > 0;
  const paddingLeft = `${depth * 1.5}rem`;

  if (!isFolder) {
    return (
      <a 
        href={item.data?.html_url} 
        target="_blank" 
        rel="noreferrer"
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-dim))] hover:text-[hsl(var(--primary))] transition-colors rounded text-sm font-mono group border-l border-transparent hover:border-[hsl(var(--primary))]"
        style={{ paddingLeft }}
      >
        <File size={14} className="shrink-0 opacity-50 group-hover:opacity-100" />
        <span className="truncate">{name}</span>
      </a>
    );
  }

  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-main))] cursor-pointer transition-colors rounded text-sm font-medium select-none"
        style={{ paddingLeft }}
      >
        {isOpen ? (
          <ChevronDown size={14} className="shrink-0 text-[hsl(var(--primary))]" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-[hsl(var(--text-dim))]" />
        )}
        <Folder size={14} className={`shrink-0 ${isOpen ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--text-dim))]'}`} />
        <span className="truncate">{name}</span>
      </div>
      {isOpen && (
        <div className="border-l border-[hsl(var(--surface-2))] ml-2">
          {Object.keys(item.children).sort().map((childName) => (
            <FileTreeItem 
              key={childName} 
              name={childName} 
              item={item.children[childName]} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * FileTree component props.
 */
interface FileTreeProps {
  /** Array of file nodes from the repository */
  files: FileNode[];
}

/**
 * File tree component that renders a hierarchical view of repository files.
 * Uses buildTree to convert flat file list into nested structure.
 * 
 * @param props.files - Array of FileNode objects with path information
 * 
 * @example
 * <FileTree files={repositoryFiles} />
 */
export const FileTree: React.FC<FileTreeProps> = ({ files }) => {
  if (files.length === 0) {
    return (
      <div className="text-center text-[hsl(var(--text-dim))] mt-10">
        No files loaded.
      </div>
    );
  }

  const tree = buildTree(files);

  return (
    <div className="space-y-1">
      {Object.keys(tree.children).sort().map(childName => (
        <FileTreeItem 
          key={childName} 
          name={childName} 
          item={tree.children[childName]} 
          depth={0} 
        />
      ))}
    </div>
  );
};
