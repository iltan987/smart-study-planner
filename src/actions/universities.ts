'use server';

let cachedData: string[] | null = null;

export const getUniversities = async () => {
  if (cachedData) {
    return cachedData;
  }

  try {
    cachedData = await import(
      '@/data/world_universities_and_domains_name.json'
    );
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
