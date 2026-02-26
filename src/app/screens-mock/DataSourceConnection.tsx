import { SourceCard } from '../components/SourceCard';
import { mockDataSources, mockUploadHistory } from '../data/mockData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';

interface DataSourceConnectionProps {
  onSelectSource: (sourceId: string) => void;
  onManualEntry?: () => void;
}

export function DataSourceConnection({ onSelectSource, onManualEntry }: DataSourceConnectionProps) {
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Add Research / Analytics Source</h1>
          <p className="text-gray-600">Connect your research outputs and analytics to discover actionable insights</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {mockDataSources.map((source) => (
            <SourceCard
              key={source.id}
              name={source.name}
              description={source.description}
              icon={source.icon}
              buttonLabel={source.id === 'manual-entry' ? 'Start' : 'Connect'}
              onConnect={() => {
                if (source.id === 'manual-entry' && onManualEntry) {
                  onManualEntry();
                } else {
                  onSelectSource(source.id);
                }
              }}
            />
          ))}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Ingestion History</h2>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Insights</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUploadHistory.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell className="font-medium">{upload.fileName}</TableCell>
                  <TableCell>{upload.uploadedBy}</TableCell>
                  <TableCell>{new Date(upload.date).toLocaleDateString()}</TableCell>
                  <TableCell>{upload.insights}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      {upload.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}