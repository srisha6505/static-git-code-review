export interface RepoEntry {
  team_name: string;
  repo_link: string;
}

/**
 * Load repositories from Google Sheets (published as CSV)
 * 
 * Setup Instructions:
 * 1. Open your Google Sheet with form responses
 * 2. Click File → Share → Publish to web
 * 3. Select "Comma-separated values (.csv)" format
 * 4. Select the sheet with responses
 * 5. Click "Publish" and copy the link
 * 6. Paste the link in GOOGLE_SHEET_CSV_URL below
 */

// Replace this with your published Google Sheets CSV URL
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSMAId5b2Q6C6I0XcaK7Ga_y55O9YubeEeiQLqNWCW-_7YtFhEdlLfS-afXeyVk5W91odWpUTIsv8J7/pub?gid=868492758&single=true&output=csv';
// Example: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS.../pub?output=csv'

export const loadRepoCSV = async (): Promise<RepoEntry[]> => {
  // Try Google Sheets first
  if (GOOGLE_SHEET_CSV_URL && GOOGLE_SHEET_CSV_URL !== 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
    try {
      console.log('Loading repositories from Google Sheets...');
      const response = await fetch(GOOGLE_SHEET_CSV_URL);
      if (response.ok) {
        const text = await response.text();
        const repos = parseCSV(text);
        console.log(`✅ Loaded ${repos.length} repositories from Google Sheets`);
        return repos;
      }
    } catch (e) {
      console.warn('Failed to load from Google Sheets:', e);
    }
  }

  // Fallback to local CSV
  try {
    const csvResponse = await fetch('/Event Registration (Responses) - Form Responses 1 (1).csv');
    if (csvResponse.ok) {
      const text = await csvResponse.text();
      const repos = parseCSV(text);
      console.log(`✅ Loaded ${repos.length} repositories from local CSV`);
      return repos;
    }
  } catch (e) {
    console.warn('No repos.csv found in public folder');
  }

  // Try Excel as last resort
  try {
    const xlsxResponse = await fetch('/repos.xlsx');
    if (xlsxResponse.ok) {
      const blob = await xlsxResponse.blob();
      return parseExcel(blob);
    }
  } catch (e) {
    console.warn('No repos.xlsx found in public folder');
  }

  return [];
};

const parseCSV = (text: string): RepoEntry[] => {
  // Split into lines but handle multi-line quoted fields
  const rows = parseCSVRows(text);
  if (rows.length < 2) return [];

  // Parse header row
  const headers = rows[0].map(h => h.trim());

  console.log('CSV Headers found:', headers);

  // Find the column indices - case insensitive matching
  const teamIdx = headers.findIndex(h => 
    h.toLowerCase().includes('team name') || h.toLowerCase() === 'team_name'
  );
  
  const repoIdx = headers.findIndex(h => 
    h.toLowerCase().includes('github repository link') || 
    h.toLowerCase().includes('repo link') ||
    h.toLowerCase() === 'repo_link'
  );

  if (teamIdx === -1 || repoIdx === -1) {
    console.error('CSV parsing error:');
    console.error('- Team Name column found at index:', teamIdx);
    console.error('- Repo Link column found at index:', repoIdx);
    console.error('Available headers:', headers);
    return [];
  }

  console.log(`Found columns: Team Name at index ${teamIdx}, Repo Link at index ${repoIdx}`);

  const repos: RepoEntry[] = [];
  
  // Parse data rows
  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i];
    
    const teamName = cols[teamIdx]?.trim();
    const repoLink = cols[repoIdx]?.trim();

    if (teamName && repoLink) {
      repos.push({
        team_name: teamName,
        repo_link: repoLink
      });
    }
  }

  return repos;
};

/**
 * Parse CSV text into rows, handling multi-line quoted fields
 */
const parseCSVRows = (text: string): string[][] => {
  const rows: string[][] = [];
  const lines = text.split('\n');
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let currentLine = '';

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    currentLine += (currentLine ? '\n' : '') + line;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // If we're not in quotes, this line is complete
    if (!inQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      currentLine = '';
    }
  }

  return rows;
};



const parseExcel = async (blob: Blob): Promise<RepoEntry[]> => {
  // If you want Excel support, install xlsx: npm install xlsx
  // Then import and use it like this:
  // import * as XLSX from 'xlsx';
  // const arrayBuffer = await blob.arrayBuffer();
  // const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  // const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  // const data = XLSX.utils.sheet_to_json(worksheet);
  // return data.map((row: any) => ({
  //   team_name: row['Team Name'] || row.team_name,
  //   repo_link: row['GitHub Repository Link(link to the project){Please make sure repo is public}'] || row.repo_link
  // }));
  
  console.warn('Excel parsing requires xlsx library. Please use CSV format or install: npm install xlsx');
  return [];
};
