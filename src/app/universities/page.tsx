'use client';

import { useEffect, useState } from 'react';
import { getUniversitiesWithPagination } from '@/actions/universities';

export default function Universities() {
  const [universities, setUniversities] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [limit, _setLimit] = useState(10);
  const [_totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchUniversities = async () => {
      getUniversitiesWithPagination(page, limit).then((universities) => {
        if (universities && 'error' in universities) {
          console.error(universities.error);
        } else {
          setUniversities(universities || []);
          setTotalPages(Math.ceil(universities.length / limit));
        }
      });
    };
    fetchUniversities();
  }, [page, limit]);

  return (
    <div>
      <h1>Universities</h1>
      <ul>
        {universities.map((university, index) => (
          <li key={index}>{university}</li>
        ))}
      </ul>
      <button onClick={() => setPage(page - 1)}>Previous</button>
      <button onClick={() => setPage(page + 1)}>Next</button>
    </div>
  );
}
