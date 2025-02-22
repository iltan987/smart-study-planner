'use server';

import { promises as fs } from 'fs';
import path from 'path';

let cachedData: string[] | null = null;

export const getUniversities = async () => {
  if (cachedData) {
    return cachedData;
  }

  const filePath = path.join(
    process.cwd(),
    '/data/world_universities_and_domains_name.json'
  );

  const data = await fs.readFile(filePath, 'utf8');

  try {
    cachedData = JSON.parse(data);
    return cachedData;
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    return { error: 'Internal Server Error' };
  }
};

export const getUniversitiesWithPagination = async (
  page: number,
  limit: number
) => {
  const universities = await getUniversities();
  if (universities && 'error' in universities) {
    return universities;
  }
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return universities?.slice(startIndex, endIndex) || [];
};
