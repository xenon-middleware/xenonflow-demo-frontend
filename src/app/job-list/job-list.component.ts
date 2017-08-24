import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { JobService } from '../job.service';
import { Job } from '../job';
import { IntervalObservable } from 'rxjs/observable/IntervalObservable';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {

  jobs: Job[];

  constructor(
    private http: HttpClient,
    private jobService: JobService
  ) { }

  ngOnInit() {
    IntervalObservable.create(1000)
      .subscribe(() => {
        // Make the HTTP request:
        this.http.get<Job[]>('http://localhost:8080/jobs/').subscribe(data => {
          // Read the result field from the JSON response.
          this.jobs = data;
      });
    });
  }

  onSelect(job: Job) {
    this.jobService.setSelectedJob = job;
  }

}
