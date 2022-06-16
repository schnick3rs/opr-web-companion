export default function (err, req, res, next) {
  if (err.status) { res.statusCode = err.status; }
  console.error('Unexpected server error  ->', err.stack);
  res.setHeader('content-type', 'application/json');
  res.status(500).end({ message: 'unexpected error' });
};
