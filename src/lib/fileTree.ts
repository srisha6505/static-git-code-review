/**
 * File tree building utility for repository visualization.
 * @module lib/fileTree
 */

import { FileNode } from '../types';

/**
 * Tree node structure for file hierarchy visualization.
 */
export interface TreeNode {
  /** Child nodes (files and folders) */
  children: Record<string, TreeNode>;
  /** File data for leaf nodes */
  data?: FileNode;
}

/**
 * Builds a hierarchical tree structure from a flat list of files.
 * Used for displaying repository file structure in a tree view.
 * 
 * @param files - Array of FileNode objects with path information
 * @returns Root TreeNode with nested children representing the file hierarchy
 * 
 * @example
 * const files = [
 *   { path: 'src/index.ts', ... },
 *   { path: 'src/utils/helper.ts', ... },
 *   { path: 'README.md', ... }
 * ];
 * const tree = buildTree(files);
 * // Returns nested structure: { children: { src: { children: { ... } }, README.md: { ... } } }
 */
export const buildTree = (files: FileNode[]): TreeNode => {
  const tree: TreeNode = { children: {} };
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current: TreeNode = tree;
    
    parts.forEach((part, index) => {
      if (!current.children[part]) {
        current.children[part] = { children: {} };
      }
      current = current.children[part];
      if (index === parts.length - 1) {
        current.data = file;
      }
    });
  });
  
  return tree;
};
