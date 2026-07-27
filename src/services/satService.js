// src/services/satService.js
import satData from '../data/satData.json';

export const getSATData = () => {
  return satData;
};

export const getSATTopDistricts = (data) => {
  return [...data]
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5)
    .map((item, index) => ({ rank: index + 1, ...item }));
};

export const getSATNeedsSupport = (data) => {
  return [...data]
    .sort((a, b) => a.averageScore - b.averageScore)
    .slice(0, 5)
    .map((item, index) => ({ rank: index + 1, ...item }));
};

export const getSATStateAverage = (data) => {
  if (!data.length) return 0;
  const total = data.reduce((sum, item) => sum + item.averageScore, 0);
  return Number((total / data.length).toFixed(1));
};

export const getSATGradePerformance = (data) => {
  const grades = [...new Set(data.map((item) => item.grade))];
  return grades.map(grade => {
    const gradeData = data.filter(item => item.grade === grade);
    const avg = gradeData.reduce((sum, item) => sum + item.averageScore, 0) / gradeData.length;
    return { grade, averageScore: parseFloat(avg.toFixed(1)) };
  });
};

export const getSATSubjectPerformance = (data) => {
  const subjects = ['math', 'science', 'english', 'gujarati'];
  const subjectNames = {
    math: 'Mathematics',
    science: 'Science',
    english: 'English',
    gujarati: 'Gujarati'
  };
  return subjects.map(subject => {
    const scores = data
      .map((item) => item.subjects?.[subject])
      .filter((score) => typeof score === 'number');
    const avg = scores.length
      ? scores.reduce((sum, value) => sum + value, 0) / scores.length
      : 0;
    return { 
      subject: subjectNames[subject],
      key: subject,
      averageScore: parseFloat(avg.toFixed(1))
    };
  });
};

export const getSATStatistics = (data) => {
  return {
    top: getSATTopDistricts(data),
    bottom: getSATNeedsSupport(data),
    stateAverage: getSATStateAverage(data),
    gradePerformance: getSATGradePerformance(data),
    subjectPerformance: getSATSubjectPerformance(data),
    totalDistricts: new Set(data.map((item) => item.district)).size
  };
};

export const filterSATData = (data, filters) => {
  return data.filter(item => {
    let match = true;
    if (filters.grade && filters.grade !== 'all') {
      match = match && item.grade === filters.grade;
    }
    if (filters.semester && filters.semester !== 'all') {
      match = match && item.semester === filters.semester;
    }
    if (filters.district && filters.district.trim() !== '') {
      match = match && item.district.toLowerCase().includes(filters.district.toLowerCase());
    }
    return match;
  });
};
