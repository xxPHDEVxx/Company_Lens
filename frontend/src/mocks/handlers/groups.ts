import { http, HttpResponse, delay } from 'msw';
import { groupsDb, groupCompaniesDb } from '../data/groups';
import { companiesDb } from '../data/companies';
import type { CompanyGroup } from '../../types/api';

export const groupHandlers = [
  // Get all groups
  http.get('/api/groups', async () => {
    await delay(500);
    return HttpResponse.json(groupsDb);
  }),

  // Get group by ID
  http.get('/api/groups/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    const group = groupsDb.find(g => g.id === id);
    
    if (!group) {
      return HttpResponse.json(
        { message: 'Group not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json(group);
  }),

  // Create group
  http.post('/api/groups', async ({ request }) => {
    await delay(500);
    const newGroup = await request.json() as Partial<CompanyGroup>;
    
    const group: CompanyGroup = {
      id: (groupsDb.length + 1).toString(),
      name: newGroup.name || '',
      description: newGroup.description || '',
      companiesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      icon: newGroup.icon,
    };
    
    groupsDb.push(group);
    groupCompaniesDb[group.id] = [];
    
    return HttpResponse.json(group, { status: 201 });
  }),

  // Update group
  http.put('/api/groups/:id', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const updates = await request.json() as Partial<CompanyGroup>;
    
    const groupIndex = groupsDb.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return HttpResponse.json(
        { message: 'Group not found' },
        { status: 404 }
      );
    }
    
    groupsDb[groupIndex] = {
      ...groupsDb[groupIndex],
      ...updates,
    };
    
    return HttpResponse.json(groupsDb[groupIndex]);
  }),

  // Delete group
  http.delete('/api/groups/:id', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const groupIndex = groupsDb.findIndex(g => g.id === id);
    if (groupIndex === -1) {
      return HttpResponse.json(
        { message: 'Group not found' },
        { status: 404 }
      );
    }
    
    groupsDb.splice(groupIndex, 1);
    delete groupCompaniesDb[id as string];
    
    return HttpResponse.json({ message: 'Group deleted successfully' });
  }),

  // Get companies in a group
  http.get('/api/groups/:id/companies', async ({ params }) => {
    await delay(500);
    const { id } = params;
    
    const companyIds = groupCompaniesDb[id as string] || [];
    const companies = companiesDb.filter(company => 
      companyIds.includes(company.id)
    );
    
    return HttpResponse.json(companies);
  }),

  // Add companies to group
  http.post('/api/groups/:id/companies', async ({ params, request }) => {
    await delay(500);
    const { id } = params;
    const { companyIds } = await request.json() as { companyIds: string[] };
    
    const group = groupsDb.find(g => g.id === id);
    if (!group) {
      return HttpResponse.json(
        { message: 'Group not found' },
        { status: 404 }
      );
    }
    
    if (!groupCompaniesDb[id as string]) {
      groupCompaniesDb[id as string] = [];
    }
    
    // Add only new companies (avoid duplicates)
    const newCompanyIds = companyIds.filter(companyId => 
      !groupCompaniesDb[id as string].includes(companyId)
    );
    
    groupCompaniesDb[id as string].push(...newCompanyIds);
    
    // Update company count
    group.companiesCount = groupCompaniesDb[id as string].length;
    
    return HttpResponse.json({ 
      message: 'Companies added successfully',
      addedCount: newCompanyIds.length 
    });
  }),

  // Remove company from group
  http.delete('/api/groups/:groupId/companies/:companyId', async ({ params }) => {
    await delay(500);
    const { groupId, companyId } = params;
    
    const group = groupsDb.find(g => g.id === groupId);
    if (!group) {
      return HttpResponse.json(
        { message: 'Group not found' },
        { status: 404 }
      );
    }
    
    if (!groupCompaniesDb[groupId as string]) {
      return HttpResponse.json(
        { message: 'Company not in group' },
        { status: 404 }
      );
    }
    
    const companyIndex = groupCompaniesDb[groupId as string].indexOf(companyId as string);
    if (companyIndex === -1) {
      return HttpResponse.json(
        { message: 'Company not in group' },
        { status: 404 }
      );
    }
    
    groupCompaniesDb[groupId as string].splice(companyIndex, 1);
    
    // Update company count
    group.companiesCount = groupCompaniesDb[groupId as string].length;
    
    return HttpResponse.json({ message: 'Company removed from group successfully' });
  }),
];