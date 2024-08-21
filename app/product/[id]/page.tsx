type Props = {
  params: {
    jobid: string;
  };
};

const JobById = ({ params }: Props) => {
  return <div>page {params.jobid}</div>;
};

export default JobById;
