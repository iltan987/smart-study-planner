'use server';

let cachedData: string[] | null = null;

export const getUniversities = async (): Promise<string[] | null> => {
  if (cachedData) {
    return cachedData;
  }
  try {
    const data = await import(
      '@/data/world_universities_and_domains_name.json'
    );
    cachedData = Object.values(data.default) as string[];
    return cachedData;
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    return null;
  }
};
