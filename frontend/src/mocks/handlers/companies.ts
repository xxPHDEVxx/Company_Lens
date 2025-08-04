import { http, HttpResponse, delay } from 'msw';
import { companiesDb, getFollowedCompanies } from '../data/companies';
import type { Company } from '../../types/api';

export const companyHandlers = [
  // Get all companies
  http.get('/api/companies', async () => {
    await delay(500);
    return HttpResponse.json(companiesDb);
  }),

  // Get followed companies
  http.get('/api/companies/followed', async () => {
    await delay(500);
    const followedCompanies = getFollowedCompanies();
    return HttpResponse.json(followedCompanies);
  }),

  // Get company by ID
  http.get('/api/companies/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const company = companiesDb.find(c => c.id === id);
    
    if (!company) {
      return HttpResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(company);
  }),

  // Search companies by VAT
  http.get('/api/companies/search', async ({ request }) => {
    await delay(1000); // Simulate search delay
    const url = new URL(request.url);
    const vatNumber = url.searchParams.get('vatNumber');
    const companyType = url.searchParams.get('companyType');
    const status = url.searchParams.get('status');
    const region = url.searchParams.get('region');

    let results = companiesDb;

    // Filter by VAT number
    if (vatNumber) {
      results = results.filter(company => 
        company.vat.toLowerCase().includes(vatNumber.toLowerCase())
      );
    }

    // Filter by company type (legalForm)
    if (companyType) {
      results = results.filter(company => 
        company.legalForm === companyType
      );
    }

    // Filter by status
    if (status && status !== 'all') {
      results = results.filter(company => 
        company.status === status
      );
    }

    // Filter by region
    if (region && region !== 'all') {
      results = results.filter(company => 
        company.region === region
      );
    }

    return HttpResponse.json(results);
  }),

  // Create company
  http.post('/api/companies', async ({ request }) => {
    await delay(500);
    const newCompany = await request.json() as Partial<Company>;
    
    const company: Company = {
      id: (companiesDb.length + 1).toString(),
      name: newCompany.name || '',
      vat: newCompany.vat || '',
      status: newCompany.status || 'active',
      legalForm: newCompany.legalForm || '',
      creationDate: new Date().toLocaleDateString('fr-BE'),
      city: newCompany.city || '',
      ...newCompany,
    };
    
    companiesDb.push(company);
    return HttpResponse.json(company, { status: 201 });
  }),

  // Update company
  http.put('/api/companies/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const updates = await request.json() as Partial<Company>;
    
    const companyIndex = companiesDb.findIndex(c => c.id === id);
    if (companyIndex === -1) {
      return HttpResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      );
    }
    
    companiesDb[companyIndex] = {
      ...companiesDb[companyIndex],
      ...updates,
      lastUpdate: new Date().toLocaleDateString('fr-BE'),
    };
    
    return HttpResponse.json(companiesDb[companyIndex]);
  }),

  // Delete company
  http.delete('/api/companies/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const companyIndex = companiesDb.findIndex(c => c.id === id);
    if (companyIndex === -1) {
      return HttpResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      );
    }
    
    companiesDb.splice(companyIndex, 1);
    return HttpResponse.json({ message: 'Company deleted successfully' });
  }),

  // Follow/unfollow company
  http.post('/api/companies/:id/follow', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const company = companiesDb.find(c => c.id === id);
    if (!company) {
      return HttpResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      );
    }
    
    company.followedSince = new Date().toISOString().split('T')[0];
    return HttpResponse.json({ message: 'Company followed successfully' });
  }),

  http.delete('/api/companies/:id/follow', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const company = companiesDb.find(c => c.id === id);
    if (!company) {
      return HttpResponse.json(
        { message: 'Company not found' },
        { status: 404 }
      );
    }
    
    delete company.followedSince;
    return HttpResponse.json({ message: 'Company unfollowed successfully' });
  }),
];