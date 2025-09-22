import express from 'express';

const router = express.Router();

/**
 * GET /api/docs
 * Complete API Documentation
 */
router.get('/', (req, res) => {
  const documentation = {
    title: 'Secure Voting System API Documentation',
    version: '1.0.0',
    description: 'A comprehensive API for a secure, transparent voting system with blockchain technology, zero-knowledge proofs, and public transparency features.',
    baseUrl: `${req.protocol}://${req.get('host')}/api/voting`,
    contact: {
      name: 'Secure Voting System',
      email: 'support@securevoting.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    },
    endpoints: {
      health: {
        'GET /health': {
          description: 'Health check endpoint to verify system status',
          method: 'GET',
          path: '/health',
          responses: {
            '200': {
              description: 'System is healthy',
              example: {
                status: 'healthy',
                timestamp: '2025-09-21T16:30:00.000Z',
                uptime: 3600
              }
            }
          }
        }
      },
      registration: {
        'POST /register': {
          description: 'Register a new voter in the system',
          method: 'POST',
          path: '/api/voting/register',
          requestBody: {
            required: true,
            contentType: 'application/json',
            schema: {
              type: 'object',
              required: ['voterId', 'publicKey'],
              properties: {
                voterId: {
                  type: 'string',
                  description: 'Unique identifier for the voter',
                  example: 'voter_12345',
                  maxLength: 255
                },
                publicKey: {
                  type: 'string',
                  description: 'Elliptic curve public key (65 characters starting with 04)',
                  example: '04a1b2c3d4e5f6...',
                  pattern: '^04[a-fA-F0-9]{64}$'
                },
                registrationData: {
                  type: 'object',
                  description: 'Additional voter information',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Voter name',
                      example: 'John Doe'
                    },
                    email: {
                      type: 'string',
                      description: 'Voter email',
                      example: 'john@example.com'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Voter registered successfully',
              example: {
                success: true,
                message: 'Voter registered successfully',
                voter: {
                  id: 'voter_12345',
                  publicKey: '04a1b2c3d4e5f6...',
                  isRegistered: true,
                  hasVoted: false,
                  registrationDate: '2025-09-21T16:30:00.000Z'
                }
              }
            },
            '400': {
              description: 'Invalid request data',
              example: {
                success: false,
                error: 'Voter ID and public key are required'
              }
            },
            '409': {
              description: 'Voter already exists',
              example: {
                success: false,
                error: 'Voter with this ID already exists'
              }
            }
          }
        },
        'POST /generate-keys': {
          description: 'Generate a new cryptographic key pair for voter registration',
          method: 'POST',
          path: '/api/voting/generate-keys',
          responses: {
            '200': {
              description: 'Key pair generated successfully',
              example: {
                success: true,
                keyPair: {
                  privateKey: 'a1b2c3d4e5f6...',
                  publicKey: '04a1b2c3d4e5f6...'
                }
              }
            }
          }
        },
        'GET /voters': {
          description: 'Get all registered voters (admin only)',
          method: 'GET',
          path: '/api/voting/voters',
          responses: {
            '200': {
              description: 'List of all voters',
              example: {
                success: true,
                voters: [
                  {
                    id: 'voter_12345',
                    publicKey: '04a1b2c3d4e5f6...',
                    isRegistered: true,
                    hasVoted: false,
                    registrationDate: '2025-09-21T16:30:00.000Z'
                  }
                ],
                count: 1
              }
            }
          }
        },
        'GET /voter/:voterId': {
          description: 'Get specific voter information (admin only)',
          method: 'GET',
          path: '/api/voting/voter/:voterId',
          parameters: [
            {
              name: 'voterId',
              in: 'path',
              required: true,
              description: 'Unique voter identifier',
              example: 'voter_12345'
            }
          ],
          responses: {
            '200': {
              description: 'Voter information retrieved',
              example: {
                success: true,
                voter: {
                  id: 'voter_12345',
                  publicKey: '04a1b2c3d4e5f6...',
                  isRegistered: true,
                  hasVoted: false,
                  registrationDate: '2025-09-21T16:30:00.000Z'
                }
              }
            },
            '404': {
              description: 'Voter not found',
              example: {
                success: false,
                error: 'Voter not found'
              }
            }
          }
        }
      },
      voting: {
        'POST /submit': {
          description: 'Submit a vote for a candidate',
          method: 'POST',
          path: '/api/voting/submit',
          requestBody: {
            required: true,
            contentType: 'application/json',
            schema: {
              type: 'object',
              required: ['voterId', 'candidateId'],
              properties: {
                voterId: {
                  type: 'string',
                  description: 'Unique voter identifier',
                  example: 'voter_12345'
                },
                candidateId: {
                  type: 'string',
                  description: 'Candidate identifier',
                  example: 'candidate_1'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Vote submitted successfully',
              example: {
                success: true,
                message: 'Vote submitted successfully',
                blockIndex: 1
              }
            },
            '400': {
              description: 'Invalid vote submission',
              example: {
                success: false,
                error: 'Voter ID and candidate ID are required'
              }
            },
            '409': {
              description: 'Voter has already voted',
              example: {
                success: false,
                error: 'Voter has already cast a vote'
              }
            }
          }
        },
        'POST /create-vote': {
          description: 'Create a vote with zero-knowledge proof',
          method: 'POST',
          path: '/api/voting/create-vote',
          requestBody: {
            required: true,
            contentType: 'application/json',
            schema: {
              type: 'object',
              required: ['candidateId', 'voterId', 'privateKey'],
              properties: {
                candidateId: {
                  type: 'string',
                  description: 'Candidate identifier',
                  example: 'candidate_1'
                },
                voterId: {
                  type: 'string',
                  description: 'Voter identifier',
                  example: 'voter_12345'
                },
                privateKey: {
                  type: 'string',
                  description: 'Voter private key for signing',
                  example: 'a1b2c3d4e5f6...'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Vote created successfully',
              example: {
                success: true,
                voteData: {
                  voteHash: 'hash_12345',
                  signature: 'signature_12345',
                  zeroKnowledgeProof: 'proof_12345'
                }
              }
            }
          }
        },
        'GET /votes': {
          description: 'Get all votes (admin only)',
          method: 'GET',
          path: '/api/voting/votes',
          responses: {
            '200': {
              description: 'List of all votes',
              example: {
                success: true,
                votes: [
                  {
                    id: 'vote_12345',
                    voterId: 'voter_12345',
                    candidateId: 'candidate_1',
                    voteHash: 'hash_12345',
                    signature: 'signature_12345',
                    zeroKnowledgeProof: 'proof_12345',
                    timestamp: '2025-09-21T16:30:00.000Z',
                    blockIndex: 1
                  }
                ],
                count: 1
              }
            }
          }
        },
        'GET /votes/candidate/:candidateId': {
          description: 'Get votes for a specific candidate',
          method: 'GET',
          path: '/api/voting/votes/candidate/:candidateId',
          parameters: [
            {
              name: 'candidateId',
              in: 'path',
              required: true,
              description: 'Candidate identifier',
              example: 'candidate_1'
            }
          ],
          responses: {
            '200': {
              description: 'Votes for candidate retrieved',
              example: {
                success: true,
                candidateId: 'candidate_1',
                votes: [
                  {
                    id: 'vote_12345',
                    voterId: 'voter_12345',
                    candidateId: 'candidate_1',
                    timestamp: '2025-09-21T16:30:00.000Z'
                  }
                ],
                count: 1
              }
            }
          }
        },
        'GET /results': {
          description: 'Get voting results and candidate vote counts',
          method: 'GET',
          path: '/api/voting/results',
          responses: {
            '200': {
              description: 'Voting results retrieved',
              example: {
                success: true,
                results: {
                  'candidate_1': 5,
                  'candidate_2': 3,
                  'candidate_3': 2
                }
              }
            }
          }
        },
        'GET /stats': {
          description: 'Get comprehensive voting statistics',
          method: 'GET',
          path: '/api/voting/stats',
          responses: {
            '200': {
              description: 'Voting statistics retrieved',
              example: {
                success: true,
                stats: {
                  totalVoters: 10,
                  totalVotes: 10,
                  votingPercentage: 100,
                  averageVotingTime: 2.5,
                  mostPopularCandidate: 'candidate_1',
                  votingTrends: {
                    hourly: [1, 2, 3, 4, 5],
                    daily: [10, 15, 20, 25, 30]
                  }
                }
              }
            }
          }
        }
      },
      public: {
        'GET /public/voters': {
          description: 'Get all voters with public information (voting status, registration date)',
          method: 'GET',
          path: '/api/voting/public/voters',
          responses: {
            '200': {
              description: 'Public voter information retrieved',
              example: {
                success: true,
                voters: [
                  {
                    voterId: 'voter_12345',
                    isRegistered: true,
                    hasVoted: true,
                    registrationDate: '2025-09-21T16:30:00.000Z'
                  }
                ],
                count: 1,
                message: 'Public voter information retrieved successfully'
              }
            }
          }
        },
        'GET /public/voter/:voterId': {
          description: 'Get public information for a specific voter',
          method: 'GET',
          path: '/api/voting/public/voter/:voterId',
          parameters: [
            {
              name: 'voterId',
              in: 'path',
              required: true,
              description: 'Voter identifier',
              example: 'voter_12345'
            }
          ],
          responses: {
            '200': {
              description: 'Public voter information retrieved',
              example: {
                success: true,
                voter: {
                  voterId: 'voter_12345',
                  isRegistered: true,
                  hasVoted: true,
                  registrationDate: '2025-09-21T16:30:00.000Z'
                }
              }
            },
            '404': {
              description: 'Voter not found',
              example: {
                success: false,
                error: 'Voter not found'
              }
            }
          }
        },
        'GET /public/voting-status': {
          description: 'Get overall voting status and statistics',
          method: 'GET',
          path: '/api/voting/public/voting-status',
          responses: {
            '200': {
              description: 'Voting status retrieved',
              example: {
                success: true,
                votingStatus: {
                  totalVoters: 10,
                  votedCount: 8,
                  notVotedCount: 2,
                  votingPercentage: 80.0
                },
                results: {
                  'candidate_1': 5,
                  'candidate_2': 3
                },
                lastUpdated: '2025-09-21T16:30:00.000Z'
              }
            }
          }
        },
        'GET /public/votes': {
          description: 'Get all votes with public information (no private data)',
          method: 'GET',
          path: '/api/voting/public/votes',
          responses: {
            '200': {
              description: 'Public vote information retrieved',
              example: {
                success: true,
                votes: [
                  {
                    id: 'vote_12345',
                    voterId: 'voter_12345',
                    candidateId: 'candidate_1',
                    timestamp: '2025-09-21T16:30:00.000Z',
                    blockIndex: 1
                  }
                ],
                count: 1,
                message: 'Public vote information retrieved successfully'
              }
            }
          }
        },
        'GET /public/transparency': {
          description: 'Get comprehensive transparency data',
          method: 'GET',
          path: '/api/voting/public/transparency',
          responses: {
            '200': {
              description: 'Transparency data retrieved',
              example: {
                success: true,
                transparency: {
                  totalVoters: 10,
                  votedCount: 8,
                  notVotedCount: 2,
                  votingPercentage: 80.0,
                  totalVotes: 8,
                  results: {
                    'candidate_1': 5,
                    'candidate_2': 3
                  },
                  voterList: [
                    {
                      voterId: 'voter_12345',
                      hasVoted: true,
                      registrationDate: '2025-09-21T16:30:00.000Z'
                    }
                  ],
                  statistics: {
                    totalVoters: 10,
                    totalVotes: 8,
                    votingPercentage: 80.0
                  },
                  lastUpdated: '2025-09-21T16:30:00.000Z'
                }
              }
            }
          }
        }
      },
      security: {
        'GET /blockchain/integrity': {
          description: 'Verify blockchain integrity and detect tampering',
          method: 'GET',
          path: '/api/voting/blockchain/integrity',
          responses: {
            '200': {
              description: 'Blockchain integrity check completed',
              example: {
                success: true,
                integrity: {
                  isIntact: true,
                  issues: [],
                  lastVerified: '2025-09-21T16:30:00.000Z'
                }
              }
            }
          }
        },
        'GET /tamper-detection/activities': {
          description: 'Get suspicious activities and tamper detection logs',
          method: 'GET',
          path: '/api/voting/tamper-detection/activities',
          responses: {
            '200': {
              description: 'Suspicious activities retrieved',
              example: {
                success: true,
                activities: [
                  {
                    id: 'activity_12345',
                    type: 'duplicate_vote_attempt',
                    description: 'Duplicate vote attempt detected',
                    severity: 'medium',
                    timestamp: '2025-09-21T16:30:00.000Z',
                    voterId: 'voter_12345'
                  }
                ]
              }
            }
          }
        },
        'GET /tamper-detection/stats': {
          description: 'Get tamper detection statistics',
          method: 'GET',
          path: '/api/voting/tamper-detection/stats',
          responses: {
            '200': {
              description: 'Tamper detection statistics retrieved',
              example: {
                success: true,
                stats: {
                  totalActivities: 5,
                  highSeverity: 1,
                  mediumSeverity: 3,
                  lowSeverity: 1,
                  lastActivity: '2025-09-21T16:30:00.000Z'
                }
              }
            }
          }
        }
      }
    },
    authentication: {
      type: 'None',
      description: 'This API does not require authentication for public endpoints. Admin endpoints may require additional security measures in production.'
    },
    rateLimiting: {
      description: 'API requests are rate limited to prevent abuse',
      limits: {
        'per-minute': 100,
        'per-hour': 1000,
        'per-day': 10000
      }
    },
    errorCodes: {
      '400': 'Bad Request - Invalid request data',
      '401': 'Unauthorized - Missing or invalid credentials',
      '404': 'Not Found - Resource not found',
      '409': 'Conflict - Resource already exists',
      '429': 'Too Many Requests - Rate limit exceeded',
      '500': 'Internal Server Error - Server error occurred'
    },
    examples: {
      curl: {
        registerVoter: `curl -X POST ${req.protocol}://${req.get('host')}/api/voting/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "voterId": "voter_12345",
    "publicKey": "04a1b2c3d4e5f6...",
    "registrationData": {
      "name": "John Doe"
    }
  }'`,
        submitVote: `curl -X POST ${req.protocol}://${req.get('host')}/api/voting/submit \\
  -H "Content-Type: application/json" \\
  -d '{
    "voterId": "voter_12345",
    "candidateId": "candidate_1"
  }'`,
        getPublicVoters: `curl -X GET ${req.protocol}://${req.get('host')}/api/voting/public/voters`,
        getVotingStatus: `curl -X GET ${req.protocol}://${req.get('host')}/api/voting/public/voting-status`
      },
      javascript: {
        registerVoter: `const response = await fetch('${req.protocol}://${req.get('host')}/api/voting/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    voterId: 'voter_12345',
    publicKey: '04a1b2c3d4e5f6...',
    registrationData: {
      name: 'John Doe'
    }
  })
});
const data = await response.json();`,
        submitVote: `const response = await fetch('${req.protocol}://${req.get('host')}/api/voting/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    voterId: 'voter_12345',
    candidateId: 'candidate_1'
  })
});
const data = await response.json();`
      }
    },
    changelog: [
      {
        version: '1.0.0',
        date: '2025-09-21',
        changes: [
          'Initial release',
          'Voter registration with cryptographic keys',
          'Secure vote submission with voter ID verification',
          'Public transparency endpoints',
          'Blockchain-based vote integrity',
          'Zero-knowledge proof system',
          'Tamper detection and monitoring'
        ]
      }
    ]
  };

  res.json(documentation);
});

export default router;
