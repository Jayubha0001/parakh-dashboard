import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { FaTrophy, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';

const SATCard = ({ satData }) => {
  const { top, bottom, stateAverage, gradePerformance } = satData;

  return (
    <Card className="shadow-sm mb-4 sat-card">
      <Card.Header 
        style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          fontWeight: 'bold'
        }}
      >
        <h4 className="mb-0">
          <FaChartLine className="me-2" />
          SAT Semester Assessment
        </h4>
      </Card.Header>
      <Card.Body>
        <Row>
          {/* State Average */}
          <Col md={3} className="text-center border-end">
            <h6 className="text-muted">STATE AVERAGE</h6>
            <h2 className="text-primary">{stateAverage}%</h2>
            <small>{satData.totalDistricts} Districts</small>
          </Col>

          {/* Top District */}
          <Col md={4} className="text-center border-end">
            <h6 className="text-muted">
              <FaTrophy className="text-warning me-1" />
              TOP DISTRICT
            </h6>
            {top && top.length > 0 && (
              <>
                <h3 className="text-success">{top[0].district}</h3>
                <h4 className="text-primary">{top[0].averageScore}%</h4>
                <Badge bg="success">{top[0].grade}</Badge>
                <div><small>Pass: {top[0].passPercentage}%</small></div>
              </>
            )}
          </Col>

          {/* Needs Support */}
          <Col md={4} className="text-center">
            <h6 className="text-muted">
              <FaExclamationTriangle className="text-danger me-1" />
              NEEDS SUPPORT
            </h6>
            {bottom && bottom.length > 0 && (
              <>
                <h3 className="text-danger">{bottom[0].district}</h3>
                <h4 className="text-danger">{bottom[0].averageScore}%</h4>
                <Badge bg="danger">{bottom[0].grade}</Badge>
                <div><small>Pass: {bottom[0].passPercentage}%</small></div>
              </>
            )}
          </Col>
        </Row>

        <hr />

        {/* Top 5 Lists */}
        <Row>
          <Col md={6}>
            <h6 className="text-success">🏆 Top 5 Districts</h6>
            <ListGroup variant="flush">
              {top.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between">
                  <span>
                    <Badge bg="primary" className="me-2">{index + 1}</Badge>
                    {item.district}
                  </span>
                  <span className="fw-bold">{item.averageScore}%</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          <Col md={6}>
            <h6 className="text-danger">⚠️ Needs Support</h6>
            <ListGroup variant="flush">
              {bottom.map((item, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between">
                  <span>
                    <Badge bg="danger" className="me-2">{index + 1}</Badge>
                    {item.district}
                  </span>
                  <span className="fw-bold">{item.averageScore}%</span>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>
        </Row>

        {/* Grade Performance */}
        <hr />
        <Row>
          <Col>
            <h6 className="text-center">Grade-wise Performance</h6>
            <div className="d-flex justify-content-around">
              {gradePerformance.map((item, index) => (
                <div key={index} className="text-center">
                  <Badge bg="info">{item.grade}</Badge>
                  <div className="mt-1 fw-bold">{item.averageScore}%</div>
                </div>
              ))}
            </div>
          </Col>
        </Row>

        {/* Navigation Buttons */}
        <div className="mt-3 text-center">
          <a href="/sat-dashboard" className="btn btn-outline-primary me-2">
            📊 View Full Dashboard
          </a>
          <a href="/sat-full" className="btn btn-outline-success">
            📈 Detailed Report
          </a>
          <a href="/sat-import" className="btn btn-outline-warning">
            📤 Import Data
          </a>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SATCard;
