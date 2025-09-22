import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/voting';

const ExplorerContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const ExplorerCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
  font-size: 2.2em;
  text-align: center;
`;

const SectionTitle = styled.h2`
  color: #333;
  margin: 30px 0 15px 0;
  font-size: 1.5em;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
`;

const EndpointCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  margin: 15px 0;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const EndpointHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const MethodBadge = styled.span<{ method: string }>`
  background: ${props => {
    switch (props.method) {
      case 'GET': return '#28a745';
      case 'POST': return '#007bff';
      case 'PUT': return '#ffc107';
      case 'DELETE': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9em;
`;

const EndpointPath = styled.code`
  background: #e9ecef;
  padding: 8px 12px;
  border-radius: 5px;
  font-family: 'Courier New', monospace;
  font-size: 1.1em;
  color: #333;
`;

const Description = styled.p`
  color: #666;
  margin: 10px 0;
  line-height: 1.5;
`;

const RequestSection = styled.div`
  margin: 15px 0;
`;

const RequestLabel = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  margin-bottom: 10px;
  min-height: 100px;
  font-family: 'Courier New', monospace;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' }>`
  background: ${props => {
    switch (props.variant) {
      case 'primary': return '#007bff';
      case 'secondary': return '#6c757d';
      case 'success': return '#28a745';
      case 'danger': return '#dc3545';
      default: return '#667eea';
    }
  }};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  margin: 5px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ResponseSection = styled.div`
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #28a745;
`;

const ResponseTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #333;
`;

const ResponseCode = styled.span<{ status: number }>`
  background: ${props => {
    if (props.status >= 200 && props.status < 300) return '#28a745';
    if (props.status >= 400 && props.status < 500) return '#ffc107';
    if (props.status >= 500) return '#dc3545';
    return '#6c757d';
  }};
  color: white;
  padding: 3px 8px;
  border-radius: 3px;
  font-weight: bold;
  margin-right: 10px;
`;

const ResponseBody = styled.pre`
  background: #2d3748;
  color: #e2e8f0;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 0.9em;
  margin: 10px 0;
`;


const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const CollapsibleSection = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-size: 1.2em;
  padding: 5px;
  margin-right: 10px;

  &:hover {
    color: #5a67d8;
  }
`;

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    example?: any;
  }>;
  requestBody?: {
    required: boolean;
    schema: any;
    example?: any;
  };
  responses: {
    [key: string]: {
      description: string;
      example?: any;
    };
  };
}

const ApiExplorer: React.FC = () => {
  const [responses, setResponses] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [requestData, setRequestData] = useState<{ [key: string]: any }>({});

  const endpoints: { [category: string]: ApiEndpoint[] } = {
    'Health': [
      {
        method: 'GET',
        path: '/health',
        description: 'Health check endpoint to verify system status',
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
    ],
    'Registration': [
      {
        method: 'POST',
        path: '/register',
        description: 'Register a new voter in the system',
        requestBody: {
          required: true,
          schema: {
            type: 'object',
            required: ['voterId', 'publicKey'],
            properties: {
              voterId: { type: 'string', description: 'Unique identifier for the voter' },
              publicKey: { type: 'string', description: 'Elliptic curve public key' },
              registrationData: { type: 'object', description: 'Additional voter information' }
            }
          },
          example: {
            voterId: 'voter_12345',
            publicKey: '04a1b2c3d4e5f6...',
            registrationData: {
              name: 'John Doe',
              email: 'john@example.com'
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
          }
        }
      },
      {
        method: 'POST',
        path: '/generate-keys',
        description: 'Generate a new cryptographic key pair for voter registration',
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
      {
        method: 'GET',
        path: '/voters',
        description: 'Get all registered voters (admin only)',
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
      {
        method: 'GET',
        path: '/voter/:voterId',
        description: 'Get specific voter information (admin only)',
        parameters: [
          {
            name: 'voterId',
            type: 'string',
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
          }
        }
      }
    ],
    'Voting': [
      {
        method: 'POST',
        path: '/submit',
        description: 'Submit a vote for a candidate',
        requestBody: {
          required: true,
          schema: {
            type: 'object',
            required: ['voterId', 'candidateId'],
            properties: {
              voterId: { type: 'string', description: 'Unique voter identifier' },
              candidateId: { type: 'string', description: 'Candidate identifier' }
            }
          },
          example: {
            voterId: 'voter_12345',
            candidateId: 'candidate_1'
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
          }
        }
      },
      {
        method: 'GET',
        path: '/votes',
        description: 'Get all votes (admin only)',
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
                  timestamp: '2025-09-21T16:30:00.000Z',
                  blockIndex: 1
                }
              ],
              count: 1
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/votes/candidate/:candidateId',
        description: 'Get votes for a specific candidate',
        parameters: [
          {
            name: 'candidateId',
            type: 'string',
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
      {
        method: 'GET',
        path: '/results',
        description: 'Get voting results and candidate vote counts',
        responses: {
          '200': {
            description: 'Voting results retrieved',
            example: {
              success: true,
              results: {
                candidate_1: 5,
                candidate_2: 3,
                candidate_3: 2
              }
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/stats',
        description: 'Get comprehensive voting statistics',
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
                mostPopularCandidate: 'candidate_1'
              }
            }
          }
        }
      }
    ],
    'Public Endpoints': [
      {
        method: 'GET',
        path: '/public/voters',
        description: 'Get all voters with public information',
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
              count: 1
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/public/voter/:voterId',
        description: 'Get public information for a specific voter',
        parameters: [
          {
            name: 'voterId',
            type: 'string',
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
          }
        }
      },
      {
        method: 'GET',
        path: '/public/voting-status',
        description: 'Get overall voting status and statistics',
        responses: {
          '200': {
            description: 'Voting status retrieved',
            example: {
              success: true,
              votingStatus: {
                totalVoters: 10,
                votedCount: 8,
                notVotedCount: 2,
                votingPercentage: 80
              },
              results: {
                candidate_1: 5,
                candidate_2: 3
              },
              lastUpdated: '2025-09-21T16:30:00.000Z'
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/public/votes',
        description: 'Get all votes with public information',
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
              count: 1
            }
          }
        }
      },
      {
        method: 'GET',
        path: '/public/transparency',
        description: 'Get comprehensive transparency data',
        responses: {
          '200': {
            description: 'Transparency data retrieved',
            example: {
              success: true,
              transparency: {
                totalVoters: 10,
                votedCount: 8,
                notVotedCount: 2,
                votingPercentage: 80,
                totalVotes: 8,
                results: {
                  candidate_1: 5,
                  candidate_2: 3
                },
                lastUpdated: '2025-09-21T16:30:00.000Z'
              }
            }
          }
        }
      }
    ],
    'Security': [
      {
        method: 'GET',
        path: '/blockchain/integrity',
        description: 'Verify blockchain integrity and detect tampering',
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
      {
        method: 'GET',
        path: '/tamper-detection/activities',
        description: 'Get suspicious activities and tamper detection logs',
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
      {
        method: 'GET',
        path: '/tamper-detection/stats',
        description: 'Get tamper detection statistics',
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
    ]
  };

  const makeRequest = async (endpoint: ApiEndpoint, category: string) => {
    const endpointKey = `${category}-${endpoint.method}-${endpoint.path}`;
    setLoading(prev => ({ ...prev, [endpointKey]: true }));

    try {
      let url = `${API_BASE_URL}${endpoint.path}`;
      
      // Replace path parameters with actual values
      if (endpoint.parameters) {
        endpoint.parameters.forEach(param => {
          const paramValue = requestData[`${endpointKey}-${param.name}`] || param.example || '';
          url = url.replace(`:${param.name}`, paramValue);
        });
      }

      let response: any = null;
      if (endpoint.method === 'GET') {
        response = await axios.get(url);
      } else if (endpoint.method === 'POST') {
        const body = requestData[`${endpointKey}-body`] || endpoint.requestBody?.example || {};
        response = await axios.post(url, body);
      }

      setResponses(prev => ({
        ...prev,
        [endpointKey]: {
          status: response?.status,
          data: response?.data,
          headers: response?.headers
        }
      }));
    } catch (error: any) {
      setResponses(prev => ({
        ...prev,
        [endpointKey]: {
          status: error.response?.status || 'Error',
          data: error.response?.data || { error: error.message },
          headers: error.response?.headers
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpointKey]: false }));
    }
  };

  const toggleSection = (category: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const updateRequestData = (endpointKey: string, field: string, value: any) => {
    setRequestData(prev => ({
      ...prev,
      [`${endpointKey}-${field}`]: value
    }));
  };

  const renderEndpoint = (endpoint: ApiEndpoint, category: string) => {
    const endpointKey = `${category}-${endpoint.method}-${endpoint.path}`;
    const response = responses[endpointKey];
    const isLoading = loading[endpointKey];

    return (
      <EndpointCard key={endpointKey}>
        <EndpointHeader>
          <div>
            <MethodBadge method={endpoint.method}>{endpoint.method}</MethodBadge>
            <EndpointPath>{endpoint.path}</EndpointPath>
          </div>
          <Button
            onClick={() => makeRequest(endpoint, category)}
            disabled={isLoading}
            variant="primary"
          >
            {isLoading ? <LoadingSpinner /> : null}
            {isLoading ? 'Loading...' : 'Send Request'}
          </Button>
        </EndpointHeader>

        <Description>{endpoint.description}</Description>

        {/* Parameters */}
        {endpoint.parameters && (
          <RequestSection>
            <RequestLabel>Path Parameters:</RequestLabel>
            {endpoint.parameters.map(param => (
              <div key={param.name}>
                <Input
                  type="text"
                  placeholder={`${param.name} (${param.type}) - ${param.description}`}
                  value={requestData[`${endpointKey}-${param.name}`] || ''}
                  onChange={(e) => updateRequestData(endpointKey, param.name, e.target.value)}
                />
              </div>
            ))}
          </RequestSection>
        )}

        {/* Request Body */}
        {endpoint.requestBody && (
          <RequestSection>
            <RequestLabel>Request Body (JSON):</RequestLabel>
            <TextArea
              placeholder={JSON.stringify(endpoint.requestBody.example || {}, null, 2)}
              value={requestData[`${endpointKey}-body`] || ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  updateRequestData(endpointKey, 'body', parsed);
                } catch {
                  updateRequestData(endpointKey, 'body', e.target.value);
                }
              }}
            />
            <Button
              onClick={() => {
                const example = endpoint.requestBody?.example || {};
                updateRequestData(endpointKey, 'body', example);
              }}
              variant="secondary"
            >
              Use Example
            </Button>
          </RequestSection>
        )}

        {/* Response */}
        {response && (
          <ResponseSection>
            <ResponseTitle>
              Response:
              <ResponseCode status={response.status}>
                {response.status}
              </ResponseCode>
            </ResponseTitle>
            <ResponseBody>
              {JSON.stringify(response.data, null, 2)}
            </ResponseBody>
          </ResponseSection>
        )}
      </EndpointCard>
    );
  };

  return (
    <ExplorerContainer>
      <ExplorerCard>
        <Title>🔧 API Explorer</Title>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
          Test all available API endpoints for the Secure Voting System
        </p>
      </ExplorerCard>

      {Object.entries(endpoints).map(([category, categoryEndpoints]) => (
        <ExplorerCard key={category}>
          <SectionTitle>
            <ToggleButton onClick={() => toggleSection(category)}>
              {expandedSections[category] ? '▼' : '▶'}
            </ToggleButton>
            {category}
          </SectionTitle>
          
          <CollapsibleSection isOpen={expandedSections[category]}>
            {categoryEndpoints.map(endpoint => renderEndpoint(endpoint, category))}
          </CollapsibleSection>
        </ExplorerCard>
      ))}
    </ExplorerContainer>
  );
};

export default ApiExplorer;
