import axios from 'axios';

// Base URLs for NCBI E-utilities
const ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const ESUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

// Build the search query matching the requested keywords
const buildQuery = () => {
  const keywords = [
    'asbestos',
    'mesothelioma',
    'asbestosis',
    '"asbestos-related diseases"',
    'chrysotile',
    'amosite',
    'tremolite',
    'actinolite',
    'crocidolite',
    'anthophyllite'
  ];
  return keywords.join(' OR ');
};

export const fetchPubMedPapers = async (retmax = 20, retstart = 0) => {
  try {
    const term = buildQuery();

    // Step 1: Search for IDs
    const searchRes = await axios.get(ESEARCH_URL, {
      params: {
        db: 'pubmed',
        term,
        retmode: 'json',
        retmax,
        retstart,
        sort: 'pub_date' // most recent first
      }
    });

    const idList = searchRes.data?.esearchresult?.idlist || [];
    if (idList.length === 0) return [];

    // Step 2: Fetch summaries for those IDs
    const summaryRes = await axios.get(ESUMMARY_URL, {
      params: {
        db: 'pubmed',
        id: idList.join(','),
        retmode: 'json'
      }
    });

    const result = summaryRes.data?.result || {};
    const papers = idList.map(id => {
      const paperData = result[id];
      if (!paperData) return null;

      return {
        id,
        title: paperData.title,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        authors: paperData.authors?.map(a => a.name).join(', ') || 'Unknown Authors',
        pubDate: paperData.pubdate,
        source: paperData.source
      };
    }).filter(Boolean);

    return papers;
  } catch (error) {
    console.error("Error fetching from PubMed:", error);
    return [];
  }
};
