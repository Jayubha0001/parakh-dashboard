/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Badge, 
  Button, Form, Spinner, Alert 
} from 'react-bootstrap';
import { 
  FaTrophy, FaExclamationTriangle, FaChartLine, 
  FaFileImport, FaFilter, FaDownload
} from 'react-icons/fa';
import { 
  getSATData, getSATStatistics, filterSATData 
} from '../services/satService';
import '../../styles/sat.css';

const SATDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [satData, setSatData] = useState([]);
  const [stats, setStats] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [filters, setFilters] = useState({
    grade: 'all',
    semester: 'all',
    district: ''
  });

  const loadData = () => {
    setLoading(true);
    const data = getSATData();
    setSatData(data);
    setFilteredData(data);
    const statistics = getSATStatistics(data);
    setStats(statistics);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    const filtered = filterSATData(satData, newFilters);
    setFilteredData(filtered);
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading SAT Data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-4">
            <FaChartLine className="text-primary me-3" />
            SAT Semester Assessment Dashboard
          </h1>
          <p className="text-muted">
            Tracking semester assessment performance across {satData.length} districts
          </p>
        </Col>
        <Col md="auto" className="d-flex align-items-center">
          <Button variant="primary" href="/sat-import" className="me-2">
            <FaFileImport /> Import Data
          </Button>
          <Button variant="success">
            <FaDownload /> Export Report
          </Button>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center sat-gradient-primary text-white shadow-sm">
            <Card.Body>
              <h6>🏆 TOP DISTRICT</h6>
              {stats?.top?.[0] && (
                <>
                  <h3>{stats.top[0].district}</h3>
                  <h2>{stats.top[0].averageScore}%</h2>
                  <Badge bg="light" text="dark">{stats.top[0].grade}</Badge>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center sat-gradient-danger text-white shadow-sm">
            <Card.Body>
              <h6>⚠️ NEEDS SUPPORT</h6>
              {stats?.bottom?.[0] && (
                <>
                  <h3>{stats.bottom[0].district}</h3>
                  <h2>{stats.bottom[0].averageScore}%</h2>
                  <Badge bg="light" text="dark">{stats.bottom[0].grade}</Badge>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center sat-gradient-success text-white shadow-sm">
            <Card.Body>
              <h6>📊 STATE AVERAGE</h6>
              <h2>{stats?.stateAverage || 0}%</h2>
              <small>{satData.length} Districts</small>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="text-center sat-gradient-info text-white shadow-sm">
            <Card.Body>
              <h6>🎯 GRADE PERFORMANCE</h6>
              {stats?.gradePerformance?.map((item, idx) => (
                <div key={idx}>
                  {item.grade}: {item.averageScore}%
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Subject Performance */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">📚 Subject-wise Performance</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                {stats?.subjectPerformance?.map((item, idx) => (
                  <Col md={3} key={idx}>
                    <Card className="text-center">
                      <Card.Body>
                        <h6>{item.subject}</h6>
                        <h3 className={item.averageScore >= 80 ? 'text-success' : item.averageScore >= 60 ? 'text-warning' : 'text-danger'}>
                          {item.averageScore}%
                        </h3>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label><FaFilter /> Grade</Form.Label>
                <Form.Select 
                  name="grade" 
                  value={filters.grade}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Grades</option>
                  <option value="G3">G3</option>
                  <option value="G6">G6</option>
                  <option value="G9">G9</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Semester</Form.Label>
                <Form.Select 
                  name="semester"
                  value={filters.semester}
                  onChange={handleFilterChange}
                >
                  <option value="all">All Semesters</option>
                  <option value="SEM1">SEM 1</option>
                  <option value="SEM2">SEM 2</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Search District</Form.Label>
                <Form.Control 
                  type="text" 
                  name="district"
                  placeholder="Type district name..."
                  value={filters.district}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <Alert variant="info">
                Showing {filteredData.length} of {satData.length} districts
              </Alert>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Top 5 & Bottom 5 */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0"><FaTrophy /> Top 5 Districts</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>District</th>
                    <th>Grade</th>
                    <th>Score</th>
                    <th>Pass %</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.top?.map((item, index) => (
                    <tr key={index}>
                      <td><Badge bg="primary">{index + 1}</Badge></td>
                      <td><strong>{item.district}</strong></td>
                      <td>{item.grade}</td>
                      <td className="text-success fw-bold">{item.averageScore}%</td>
                      <td>{item.passPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card>
            <Card.Header className="bg-danger text-white">
              <h5 className="mb-0"><FaExclamationTriangle /> Needs Support</h5>
            </Card.Header>
            <Card.Body>
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>District</th>
                    <th>Grade</th>
                    <th>Score</th>
                    <th>Pass %</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.bottom?.map((item, index) => (
                    <tr key={index}>
                      <td><Badge bg="danger">{index + 1}</Badge></td>
                      <td><strong>{item.district}</strong></td>
                      <td>{item.grade}</td>
                      <td className="text-danger fw-bold">{item.averageScore}%</td>
                      <td>{item.passPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Full Data Table */}
      <Card>
        <Card.Header className="bg-dark text-white">
          <h5 className="mb-0">📋 Complete SAT Data</h5>
        </Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>District</th>
                <th>Grade</th>
                <th>Semester</th>
                <th>Academic Year</th>
                <th>Total</th>
                <th>Appeared</th>
                <th>Passed</th>
                <th>Pass %</th>
                <th>Avg Score</th>
                <th>Math</th>
                <th>Science</th>
                <th>English</th>
                <th>Gujarati</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td><strong>{item.district}</strong></td>
                  <td>{item.grade}</td>
                  <td>{item.semester}</td>
                  <td>{item.academicYear}</td>
                  <td>{item.totalStudents}</td>
                  <td>{item.appeared}</td>
                  <td>{item.passed}</td>
                  <td>{item.passPercentage}%</td>
                  <td className="fw-bold">{item.averageScore}%</td>
                  <td>{item.subjects.math}%</td>
                  <td>{item.subjects.science}%</td>
                  <td>{item.subjects.english}%</td>
                  <td>{item.subjects.gujarati}%</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SATDashboard;
