import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const EBSReadbandwidth = () => {
  const data = {
    labels: ['26/8', '27/8', '28/8', '29/8', '30/8', '31/8', '01/9', '02/9', '03/9', '04/9', '05/9', '06/9'],
    datasets: [
      {
        label: 'Disk Read Bandwidth (MiB/second)',
        data: [150, 160, 140, 145, 155, 150, 148, 145, 160, 150, 155, 150],
        borderColor: 'red',
        fill: false,
        pointBackgroundColor: 'red',
        pointBorderColor: 'red',
        tension: 0.2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 400,
      },
    },
    plugins: {
      legend: {
        display: false, // This hides the legend
      },
    },
  };

  return (
    <div style={{ width: '100%' }}> {/* Set height for better visibility */}
      <Line data={data} options={options} />
    </div>
  );
};

export default EBSReadbandwidth;
