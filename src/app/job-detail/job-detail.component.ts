import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import { JobService} from '../job.service';
import { Job } from '../job';

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})
export class JobDetailComponent implements OnInit {
  job: Job;

  constructor(
    private http: HttpClient,
    private jobService: JobService
  ) {
  }

  ngOnInit() {
    this.jobService.selectedJob.subscribe((value: Job) => {
      this.job = value;
    });
  }

}
