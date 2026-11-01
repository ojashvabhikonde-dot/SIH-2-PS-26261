import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateSyntheticSvgCertificate } from '../utils/generateDocuments';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for Docusure AI Platform...');

  // 1. Clean existing records in topological order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.reviewDecision.deleteMany();
  await prisma.anomalyFlag.deleteMany();
  await prisma.validationResult.deleteMany();
  await prisma.extractedField.deleteMany();
  await prisma.document.deleteMany();
  await prisma.application.deleteMany();
  await prisma.complianceRule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Seed Institutions
  const instApex = await prisma.institution.create({
    data: {
      name: 'Apex Institute of Technology',
      code: 'INST-APEX-01',
      type: 'COLLEGE',
      state: 'Karnataka',
      address: 'Plot 42, Electronic City Phase 1, Bangalore, 560100',
      contactEmail: 'registrar@apex.edu',
      contactPhone: '+91-80-2852-0001',
      establishedYear: 2008,
      accreditedStatus: 'NAAC A+'
    }
  });

  const instKaveri = await prisma.institution.create({
    data: {
      name: 'Kaveri University of Science & Arts',
      code: 'INST-KAVERI-02',
      type: 'UNIVERSITY',
      state: 'Tamil Nadu',
      address: 'University Enclave, OMR Road, Chennai, 600119',
      contactEmail: 'contact@kaveri.edu.in',
      contactPhone: '+91-44-2450-8800',
      establishedYear: 1996,
      accreditedStatus: 'NAAC A++'
    }
  });

  const instMetro = await prisma.institution.create({
    data: {
      name: 'Metro Horizon Polytechnic',
      code: 'INST-METRO-03',
      type: 'POLYTECHNIC',
      state: 'Maharashtra',
      address: 'Sector 18, MIDC Industrial Area, Pune, 411026',
      contactEmail: 'info@metrohorizon.ac.in',
      contactPhone: '+91-20-6712-4400',
      establishedYear: 2014,
      accreditedStatus: 'NBA Accredited'
    }
  });

  console.log('🏛️ Seeded 3 institutions.');

  // 3. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const userApplicant = await prisma.user.create({
    data: {
      email: 'applicant@apex.edu',
      password: passwordHash,
      name: 'Dr. Rajesh Sharma',
      role: 'APPLICANT',
      designation: 'Director & Regulatory Head',
      institutionId: instApex.id
    }
  });

  const userOfficer = await prisma.user.create({
    data: {
      email: 'officer@aicte.gov.in',
      password: passwordHash,
      name: 'Smt. Priya Sundaram',
      role: 'OFFICER',
      designation: 'Senior Verification Officer (Regional Bureau)'
    }
  });

  const userAdmin = await prisma.user.create({
    data: {
      email: 'admin@aicte.gov.in',
      password: passwordHash,
      name: 'Shri Amitabh Roy',
      role: 'ADMIN',
      designation: 'Chief Compliance Officer & System Administrator'
    }
  });

  console.log('👤 Seeded 3 demo users (Applicant, Officer, Admin).');

  // 4. Seed Compliance Rules
  const rules = [
    {
      code: 'RULE_FIRE_NOC_MANDATORY',
      title: 'Mandatory Fire Safety NOC',
      description: 'A valid Fire Safety NOC issued by the State/Municipal Fire Service Directorate must be submitted for all instructional buildings.',
      category: 'MANDATORY',
      severity: 'CRITICAL',
      isActive: true,
      ruleJson: JSON.stringify({
        type: 'REQUIRED_DOCUMENT',
        targetDocumentType: 'FIRE_NOC',
        minValidityMonths: 6
      })
    },
    {
      code: 'RULE_LAND_DEED_VALIDITY',
      title: 'Land Ownership / Long-term Lease Validity',
      description: 'Registered land deed or registered lease agreement must have at least 12 months remaining validity from date of application.',
      category: 'LEGAL',
      severity: 'CRITICAL',
      isActive: true,
      ruleJson: JSON.stringify({
        type: 'EXPIRY_CHECK',
        targetDocumentType: 'LAND_DOCUMENT',
        minValidityMonths: 12
      })
    },
    {
      code: 'RULE_NAME_CONSISTENCY',
      title: 'Legal Entity Name Consistency',
      description: 'The institutional name on statutory clearances, land deeds, and society registration must match the application legal title exactly.',
      category: 'MANDATORY',
      severity: 'CRITICAL',
      isActive: true,
      ruleJson: JSON.stringify({
        type: 'CROSS_MATCH',
        field: 'institutionName',
        threshold: 0.95
      })
    },
    {
      code: 'RULE_BUILDING_SAFETY_PLAN',
      title: 'Approved Structural & Fire Evacuation Plan',
      description: 'Architectural blueprint approved by municipal/urban development authority with clear demarcation of labs, exits, and setbacks.',
      category: 'INFRASTRUCTURE',
      severity: 'CRITICAL',
      isActive: true,
      ruleJson: JSON.stringify({
        type: 'REQUIRED_DOCUMENT',
        targetDocumentType: 'BUILDING_PLAN'
      })
    },
    {
      code: 'RULE_SOCIETY_REGISTRATION',
      title: 'Valid Society / Trust Registration Charter',
      description: 'Registration certificate under Societies Registration Act / Public Trust Act declaring non-profit educational objectives.',
      category: 'LEGAL',
      severity: 'WARNING',
      isActive: true,
      ruleJson: JSON.stringify({
        type: 'REQUIRED_DOCUMENT',
        targetDocumentType: 'SOCIETY_REGISTRATION'
      })
    },
    {
      code: 'RULE_MIN_DOCUMENT_COUNT',
      title: 'Minimum Regulatory Document Submissions',
      description: 'Every institutional program renewal or new affiliation application must submit a minimum of 4 distinct statutory clearance documents.',
      category: 'MANDATORY',
      severity: 'WARNING',
      isActive: true,
      ruleJson: JSON.stringify({
        type: 'MIN_COUNT',
        minCount: 4
      })
    }
  ];

  for (const r of rules) {
    await prisma.complianceRule.create({ data: r });
  }

  console.log('📜 Seeded 6 regulatory compliance rules.');

  // 5. Generate Synthetic Documents & Create 12 Applications Covering All Scenarios

  // Shared duplicate document hash for duplicate reuse testing
  let sharedDuplicateHash = '';

  const applicationsDef = [
    {
      appNo: 'APP-2024-001',
      inst: instApex,
      program: 'ENGINEERING',
      academicYear: '2024-25',
      status: 'APPROVED',
      trustScore: 98,
      scenario: 'CLEAN_APPROVAL',
      summary: 'All 4 statutory certificates verified. Perfect cross-document entity alignment. QR verification validated against state registry.'
    },
    {
      appNo: 'APP-2024-002',
      inst: instApex,
      program: 'MANAGEMENT',
      academicYear: '2024-25',
      status: 'NEEDS_ATTENTION',
      trustScore: 62,
      scenario: 'EXPIRED_CERTIFICATE',
      summary: 'Fire Safety NOC expired on 2023-11-10. Regulatory rule RULE_FIRE_NOC_MANDATORY failed.'
    },
    {
      appNo: 'APP-2024-003',
      inst: instKaveri,
      program: 'ENGINEERING',
      academicYear: '2024-25',
      status: 'NEEDS_ATTENTION',
      trustScore: 58,
      scenario: 'MISMATCHED_NAME',
      summary: 'Land deed lists "Kaveri Trust for Modern Education" instead of accredited title "Kaveri University of Science & Arts".'
    },
    {
      appNo: 'APP-2024-004',
      inst: instMetro,
      program: 'ENGINEERING',
      academicYear: '2024-25',
      status: 'NEEDS_ATTENTION',
      trustScore: 35,
      scenario: 'DUPLICATE_REUSE',
      summary: 'Exact SHA-256 hash match detected across applications (reused certificate from another campus). Integrity violation flagged.'
    },
    {
      appNo: 'APP-2024-005',
      inst: instMetro,
      program: 'MANAGEMENT',
      academicYear: '2024-25',
      status: 'NEEDS_ATTENTION',
      trustScore: 28,
      scenario: 'TAMPERED_IMAGE',
      summary: 'Image Forensics (ELA) detected pixel manipulation and altered expiry date font over Building Plan. High tampering confidence (94%).'
    },
    {
      appNo: 'APP-2024-006',
      inst: instApex,
      program: 'PHARMACY',
      academicYear: '2024-25',
      status: 'CLARIFICATION_REQUESTED',
      trustScore: 52,
      scenario: 'MISSING_DOCUMENT',
      summary: 'Mandatory Building Plan certificate missing from submission package. Clarification requested from applicant.'
    },
    {
      appNo: 'APP-2024-007',
      inst: instKaveri,
      program: 'ARCHITECTURE',
      academicYear: '2024-25',
      status: 'UNDER_REVIEW',
      trustScore: 96,
      scenario: 'QR_AUTHENTIC',
      summary: 'Statutory QR payload cryptographically verified against Central Educational Registry. Queue priority high.'
    },
    {
      appNo: 'APP-2024-008',
      inst: instApex,
      program: 'ENGINEERING',
      academicYear: '2024-25',
      status: 'SUBMITTED',
      trustScore: 90,
      scenario: 'NEW_SUBMISSION',
      summary: 'Recently submitted AICTE program extension application. Ready for officer triage.'
    },
    {
      appNo: 'APP-2024-009',
      inst: instKaveri,
      program: 'MANAGEMENT',
      academicYear: '2024-25',
      status: 'APPROVED',
      trustScore: 94,
      scenario: 'HISTORICAL_APPROVED',
      summary: 'Approved with condition: Annual fire drill compliance report to be filed by Q3.'
    },
    {
      appNo: 'APP-2024-010',
      inst: instMetro,
      program: 'ARCHITECTURE',
      academicYear: '2024-25',
      status: 'REJECTED',
      trustScore: 41,
      scenario: 'REJECTED_NON_COMPLIANT',
      summary: 'Application rejected due to repeated land easement non-compliance and uncertified structure.'
    },
    {
      appNo: 'APP-2024-011',
      inst: instKaveri,
      program: 'PHARMACY',
      academicYear: '2024-25',
      status: 'CLARIFICATION_REQUESTED',
      trustScore: 68,
      scenario: 'AWAITING_RESPONSE',
      summary: 'Pending clarification regarding Society Registration amendment clause 4.2.'
    },
    {
      appNo: 'APP-2024-012',
      inst: instApex,
      program: 'ENGINEERING',
      academicYear: '2024-25',
      status: 'DRAFT',
      trustScore: 0,
      scenario: 'DRAFT_IN_PROGRESS',
      summary: 'Draft application under preparation by institution director.'
    }
  ];

  for (const def of applicationsDef) {
    const app = await prisma.application.create({
      data: {
        applicationNumber: def.appNo,
        institutionId: def.inst.id,
        applicantId: userApplicant.id,
        academicYear: def.academicYear,
        programCategory: def.program,
        status: def.status,
        overallTrustScore: def.trustScore,
        aiSummary: def.summary,
        assignedOfficerId: ['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CLARIFICATION_REQUESTED'].includes(def.status) ? userOfficer.id : null,
        submittedAt: def.status !== 'DRAFT' ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) : null,
        decidedAt: ['APPROVED', 'REJECTED'].includes(def.status) ? new Date(Date.now() - 1000 * 60 * 60 * 6) : null
      }
    });

    // Skip documents for draft application
    if (def.scenario === 'DRAFT_IN_PROGRESS') {
      continue;
    }

    // Prepare Documents based on scenario
    const docConfigs = [
      {
        type: 'FIRE_NOC',
        title: 'Fire Safety Certificate',
        issuer: 'Directorate of Fire and Emergency Services',
        issue: '2024-01-10',
        expiry: def.scenario === 'EXPIRED_CERTIFICATE' ? '2023-11-10' : '2026-01-09',
        instName: def.inst.name
      },
      {
        type: 'LAND_DOCUMENT',
        title: 'Perpetual Land Conveyance & Title Deed',
        issuer: 'Sub-Registrar Office, Department of Revenue',
        issue: '2021-06-15',
        expiry: '2035-06-14',
        instName: def.scenario === 'MISMATCHED_NAME' ? 'Kaveri Trust for Modern Education' : def.inst.name
      },
      {
        type: 'AICTE_APPROVAL',
        title: 'Prior Regulatory Approval & Sanction Order',
        issuer: 'All India Council for Technical Education',
        issue: '2023-04-01',
        expiry: '2026-03-31',
        instName: def.inst.name
      },
      {
        type: 'BUILDING_PLAN',
        title: 'Approved Architectural Campus Layout Plan',
        issuer: 'Municipal Urban Planning & Development Authority',
        issue: '2022-09-20',
        expiry: '2028-09-19',
        instName: def.inst.name,
        isTampered: def.scenario === 'TAMPERED_IMAGE'
      }
    ];

    // For missing document test, omit BUILDING_PLAN
    const filteredConfigs = def.scenario === 'MISSING_DOCUMENT'
      ? docConfigs.filter(d => d.type !== 'BUILDING_PLAN')
      : docConfigs;

    for (const [idx, cfg] of filteredConfigs.entries()) {
      const isDuplicateScenario = def.scenario === 'DUPLICATE_REUSE' && cfg.type === 'FIRE_NOC';

      const certId = `${cfg.type}-${def.appNo.slice(-3)}-${idx + 10}`;
      const genResult = generateSyntheticSvgCertificate({
        certId,
        certType: cfg.type,
        title: cfg.title,
        institutionName: cfg.instName,
        issueDate: cfg.issue,
        expiryDate: cfg.expiry,
        issuingAuthority: cfg.issuer,
        isTampered: !!cfg.isTampered
      });

      let finalHash = genResult.meta.sha256Hash;
      if (def.appNo === 'APP-2024-001' && cfg.type === 'FIRE_NOC') {
        sharedDuplicateHash = finalHash;
      }
      if (isDuplicateScenario && sharedDuplicateHash) {
        finalHash = sharedDuplicateHash; // Force identical SHA-256 hash for reuse anomaly
      }

      const docTrust = cfg.isTampered ? 28 : (def.scenario === 'EXPIRED_CERTIFICATE' && cfg.type === 'FIRE_NOC' ? 55 : (isDuplicateScenario ? 35 : 98));
      const docStatus = (cfg.isTampered || isDuplicateScenario || (def.scenario === 'EXPIRED_CERTIFICATE' && cfg.type === 'FIRE_NOC')) ? 'FLAGGED' : 'VALIDATED';

      const createdDoc = await prisma.document.create({
        data: {
          applicationId: app.id,
          documentType: cfg.type,
          fileName: genResult.meta.fileName,
          originalName: genResult.meta.originalName,
          filePath: genResult.meta.filePath,
          mimeType: genResult.meta.mimeType,
          fileSize: genResult.meta.fileSize,
          sha256Hash: finalHash,
          trustScore: docTrust,
          status: docStatus,
          isTampered: !!cfg.isTampered,
          ocrCompleted: true
        }
      });

      // Extracted Fields with Bounding Boxes
      for (const bb of genResult.meta.boundingBoxes) {
        const val = genResult.meta.extractedFields[bb.field] || '';
        await prisma.extractedField.create({
          data: {
            documentId: createdDoc.id,
            fieldName: bb.field,
            fieldValue: val,
            confidence: bb.confidence,
            boundingBoxJson: JSON.stringify(bb.box),
            pageNumber: 1
          }
        });
      }

      // Anomaly Flags
      if (cfg.isTampered && genResult.meta.tamperingDetails) {
        await prisma.anomalyFlag.create({
          data: {
            applicationId: app.id,
            documentId: createdDoc.id,
            flagType: 'IMAGE_TAMPERING',
            severity: 'CRITICAL',
            confidenceScore: 0.94,
            title: 'Visual Tampering & ELA Compression Discrepancy',
            evidenceSummary: genResult.meta.tamperingDetails.evidence,
            boundingBoxJson: JSON.stringify(genResult.meta.tamperingDetails.box),
            suggestedAction: 'Require physical verification of original stamped municipal blueprint.'
          }
        });
      }

      if (isDuplicateScenario) {
        await prisma.anomalyFlag.create({
          data: {
            applicationId: app.id,
            documentId: createdDoc.id,
            flagType: 'CROSS_APP_REUSE',
            severity: 'HIGH',
            confidenceScore: 0.99,
            title: 'Cross-Application Document Reuse Anomaly',
            evidenceSummary: `Identical SHA-256 hash (${finalHash.slice(0, 16)}...) was previously submitted under Application APP-2024-001 for Apex Institute. Potential unauthorized certificate duplication across institutions.`,
            boundingBoxJson: JSON.stringify({ x: 60, y: 200, w: 680, h: 50, page: 1 }),
            suggestedAction: 'Hold application and issue statutory show-cause notice regarding duplicate document filing.'
          }
        });
      }

      // Validation Results
      if (def.scenario === 'EXPIRED_CERTIFICATE' && cfg.type === 'FIRE_NOC') {
        await prisma.validationResult.create({
          data: {
            applicationId: app.id,
            documentId: createdDoc.id,
            checkType: 'EXPIRY',
            severity: 'CRITICAL',
            status: 'FAIL',
            message: 'Fire Safety Certificate has expired on 2023-11-10.',
            fieldName: 'expiryDate',
            expectedValue: 'Active validity >= 6 months',
            actualValue: 'Expired 2023-11-10'
          }
        });
      }

      if (def.scenario === 'MISMATCHED_NAME' && cfg.type === 'LAND_DOCUMENT') {
        await prisma.validationResult.create({
          data: {
            applicationId: app.id,
            documentId: createdDoc.id,
            checkType: 'MISMATCH',
            severity: 'CRITICAL',
            status: 'FAIL',
            message: 'Institution legal title mismatch in Title Deed.',
            fieldName: 'institutionName',
            expectedValue: def.inst.name,
            actualValue: 'Kaveri Trust for Modern Education'
          }
        });
      }
    }

    // Missing Document Validation Result
    if (def.scenario === 'MISSING_DOCUMENT') {
      await prisma.validationResult.create({
        data: {
          applicationId: app.id,
          checkType: 'MISSING',
          severity: 'CRITICAL',
          status: 'FAIL',
          message: 'Mandatory Building Safety Plan certificate has not been uploaded.',
          fieldName: 'BUILDING_PLAN',
          expectedValue: 'Approved Municipal Building Layout Plan',
          actualValue: 'Not Provided'
        }
      });
    }

    // Review Decisions
    if (def.status === 'APPROVED') {
      await prisma.reviewDecision.create({
        data: {
          applicationId: app.id,
          officerId: userOfficer.id,
          decision: 'APPROVED',
          remarks: 'All statutory records verified. Clean compliance score. Approved for academic intake.',
          conditions: def.scenario === 'HISTORICAL_APPROVED' ? 'Mandatory submission of quarterly fire drill logs.' : 'Standard regulatory renewal covenants apply.'
        }
      });
    } else if (def.status === 'REJECTED') {
      await prisma.reviewDecision.create({
        data: {
          applicationId: app.id,
          officerId: userOfficer.id,
          decision: 'REJECTED',
          remarks: 'Critical setbacks and statutory non-compliance. Application failed regulatory threshold.'
        }
      });
    } else if (def.status === 'CLARIFICATION_REQUESTED') {
      await prisma.reviewDecision.create({
        data: {
          applicationId: app.id,
          officerId: userOfficer.id,
          decision: 'CLARIFICATION_REQUESTED',
          remarks: 'Clarification required regarding missing certificates and entity name variance.'
        }
      });
    }

    // Audit Log for the Application
    await prisma.auditLog.create({
      data: {
        applicationId: app.id,
        userId: userApplicant.id,
        action: 'APPLICATION_CREATED',
        details: `Application ${def.appNo} initialized for ${def.inst.name} [Program: ${def.program}].`,
        ipAddress: '10.0.4.12'
      }
    });

    if (def.status !== 'DRAFT') {
      await prisma.auditLog.create({
        data: {
          applicationId: app.id,
          userId: userApplicant.id,
          action: 'APPLICATION_SUBMITTED',
          details: `Application ${def.appNo} submitted with all statutory attachments for AI verification.`,
          ipAddress: '10.0.4.12'
        }
      });

      await prisma.auditLog.create({
        data: {
          applicationId: app.id,
          userId: null,
          action: 'AI_PIPELINE_EXECUTED',
          details: `AI multi-engine verification completed. Overall Trust Score computed: ${def.trustScore}/100.`,
          ipAddress: '127.0.0.1'
        }
      });
    }

    if (['APPROVED', 'REJECTED', 'CLARIFICATION_REQUESTED'].includes(def.status)) {
      await prisma.auditLog.create({
        data: {
          applicationId: app.id,
          userId: userOfficer.id,
          action: `OFFICER_DECISION_${def.status}`,
          details: `Verification Officer ${userOfficer.name} recorded decision: ${def.status}.`,
          ipAddress: '192.168.1.45'
        }
      });
    }
  }

  // 6. Seed Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: userApplicant.id,
        title: 'Application Approved: APP-2024-001',
        message: 'Your Engineering renewal application for Apex Institute has received regulatory approval.',
        type: 'SUCCESS',
        isRead: false,
        link: '/applications/APP-2024-001'
      },
      {
        userId: userApplicant.id,
        title: 'Clarification Requested: APP-2024-006',
        message: 'Officer Priya Sundaram requested additional documents for your Pharmacy application.',
        type: 'WARNING',
        isRead: false,
        link: '/applications/APP-2024-006'
      },
      {
        userId: userOfficer.id,
        title: 'High Risk Flag Detected',
        message: 'Application APP-2024-005 contains suspected image tampering in Building Plan (Confidence 94%).',
        type: 'DANGER',
        isRead: false,
        link: '/officer/queue'
      },
      {
        userId: userAdmin.id,
        title: 'System Audit: Compliance Rules Active',
        message: '6 regulatory compliance rules loaded into active evaluation engine.',
        type: 'INFO',
        isRead: true,
        link: '/admin/rules'
      }
    ]
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
