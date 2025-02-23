'use client';

import { useEffect, useState } from 'react';
import { getUniversities } from '@/actions/universities';

export default function Universities() {
  const [universities, setUniversities] = useState<string[]>([]);
  const [universitiesToDisplay, setUniversitiesToDisplay] = useState<string[]>(
    []
  );
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    console.log('use effect 1');
    const fetchUniversities = async () => {
      getUniversities().then((universities) => {
        if (universities) {
          setUniversities(universities);
        }
      });
    };
    fetchUniversities();
  }, []);

  useEffect(() => {
    console.log('use effect 2');
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    setUniversitiesToDisplay(universities.slice(startIndex, endIndex));
  }, [universities, page]);

  return (
    <div>
      <h1>Universities</h1>
      <ul>
        {universitiesToDisplay.map((university, index) => (
          <li key={index}>{university}</li>
        ))}
      </ul>
      <button type="button" onClick={() => setPage(page - 1)}>
        Previous
      </button>
      <button type="button" onClick={() => setPage(page + 1)}>
        Next
      </button>
    </div>
  );
}
