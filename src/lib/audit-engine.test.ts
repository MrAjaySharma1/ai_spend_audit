import { describe, it, expect } from 'vitest';
import { runAudit } from './audit-engine';
import type { AuditInput } from './audit-engine';

describe('Audit Engine', () => {
  it('detects duplicate IDE tools', () => {
    const input: AuditInput = {
      teamSize: 5,
      useCase: 'coding',
      tools: [
        { toolId: 'cursor', planId: 'cursor_pro', seats: 5, monthlySpend: 100 },
        { toolId: 'github_copilot', planId: 'copilot_pro', seats: 5, monthlySpend: 50 }
      ]
    };
    
    const result = runAudit(input);
    expect(result.duplicates.length).toBeGreaterThan(0);
    expect(result.duplicates[0]).toContain('cursor');
    expect(result.duplicates[0]).toContain('github_copilot');
  });

  it('identifies overpaying on enterprise plans for small teams', () => {
    const input: AuditInput = {
      teamSize: 2,
      useCase: 'coding',
      tools: [
        { toolId: 'cursor', planId: 'cursor_business', seats: 2, monthlySpend: 80 }
      ]
    };
    
    const result = runAudit(input);
    const finding = result.findings.find(f => f.toolId === 'cursor');
    expect(finding?.severity).toBe('warning');
    expect(finding?.recommendedPlanId).toBe('cursor_pro');
  });

  it('recommends API over seats for very small teams', () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: 'coding',
      tools: [
        { toolId: 'claude', planId: 'claude_pro', seats: 1, monthlySpend: 20 }
      ]
    };
    
    const result = runAudit(input);
    const finding = result.findings.find(f => f.toolId === 'claude');
    expect(finding?.recommendedPlanId).toBe('anthropic_api_payg');
  });

  it('flags unnecessary premium tiers like ChatGPT Pro', () => {
    const input: AuditInput = {
      teamSize: 1,
      useCase: 'coding',
      tools: [
        { toolId: 'chatgpt', planId: 'chatgpt_pro', seats: 1, monthlySpend: 200 }
      ]
    };
    
    const result = runAudit(input);
    const finding = result.findings.find(f => f.toolId === 'chatgpt');
    expect(finding?.severity).toBe('critical');
    expect(finding?.recommendedPlanId).toBe('chatgpt_plus');
    expect(finding?.savingsPerMonth).toBe(180);
  });

  it('calculates correct annual savings', () => {
    const input: AuditInput = {
      teamSize: 10,
      useCase: 'coding',
      tools: [
        { toolId: 'chatgpt', planId: 'chatgpt_pro', seats: 10, monthlySpend: 2000 }
      ]
    };
    
    const result = runAudit(input);
    expect(result.monthlySavings).toBe(1800);
    expect(result.annualSavings).toBe(1800 * 12);
  });

  it('reports optimized state for correct configurations', () => {
    const input: AuditInput = {
      teamSize: 10,
      useCase: 'coding',
      tools: [
        { toolId: 'cursor', planId: 'cursor_pro', seats: 10, monthlySpend: 200 }
      ]
    };
    
    const result = runAudit(input);
    expect(result.monthlySavings).toBe(0);
    expect(result.overallScore).toBe(100);
  });
});
