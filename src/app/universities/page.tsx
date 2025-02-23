'use client';

import { useEffect, useState } from 'react';
import { getUniversities } from '@/actions/universities';

export default function Universities() {
  const [universities, setUniversities] = useState<string[]>([]);
  const [universitiesToDisplay, setUniversitiesToDisplay] = useState<string[]>(
    []
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        const universities = await getUniversities();
        if (universities) {
          setUniversities(universities);
        }
      } catch (error) {
        console.error('Failed to fetch universities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setUniversitiesToDisplay(universities.slice(startIndex, endIndex));
  }, [universities, page]);

  return (
    <div>
      <h1>Universities</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {universitiesToDisplay.map((university, index) => (
            <li key={index}>{university}</li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </button>
      <button
        type="button"
        onClick={() => setPage(page + 1)}
        disabled={page * limit >= universities.length}
      >
        Next
      </button>
    </div>
  );
}
