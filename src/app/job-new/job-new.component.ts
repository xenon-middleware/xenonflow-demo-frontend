import { Component, OnInit, ViewChild, ViewChildren, ViewContainerRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {WebDAV, Headers} from 'angular-webdav';
import {HttpClient, HttpHeaders} from '@angular/common/http';

const URL = 'http://localhost/webdav';
const api = 'http://localhost:8080/jobs';

interface Input {
  id: string;
  type: string;
  intputBinding: object;
}

interface InputElement {
  id: string;
  type: 'checkbox' | 'file' | 'number' | 'text';
}

interface FileInput {
  id: string;
  path: string;
}

interface Workflow {
  id: string;
  inputs: Input[];
  outputs: object;
  [x: string]: any;
}

interface FileLocations {
  [x: string]: FileInput;
}

export interface WorkflowInput {
  [x: string]: object;
}

export interface JobDescription {
  name: string;
  input: WorkflowInput;
  workflow: string;
}

@Component({
  selector: 'app-job-new',
  templateUrl: './job-new.component.html',
  styleUrls: ['./job-new.component.css']
})
export class JobNewComponent {

  jobForm: FormGroup;
  public inputs: InputElement[];

  files: FileLocations;

  @ViewChild('fileInput') fileInput;
  @ViewChildren('inputFileInput') inputFileInput;

  constructor(
    private http: HttpClient,
    private webdav: WebDAV,
    private fb: FormBuilder,
    private viewContainerRef: ViewContainerRef) {
    this.jobForm = this.fb.group({
      name: ['', Validators.required ],
      inputControls: this.fb.group({})
    });

    this.inputs = [];
    this.files = {};
  }

  get inputControls(): FormGroup {
    return this.jobForm.get('inputControls') as FormGroup;
  }

  get jobName(): string {
    return this.jobForm.get('name').value as string;
  }

  processWorkflow() {
    const fi = this.fileInput.nativeElement;
    const name = this.jobName;
    if (fi.files && fi.files[0]) {
        const fileToUpload = fi.files[0];
        const reader = new FileReader();
        let workflow: Workflow;
        reader.onload = file => {
          const contents: any = file.target;
          workflow = JSON.parse(contents.result);

          console.log(workflow);

          const id: string = workflow.id;

          workflow.inputs.forEach(input => {
            const inputid: string = input.id.replace(id + '/', '');
            const inputElement: InputElement = {
              id: inputid,
              type: 'text'
            };

            if (input.type !== 'File') {
              this.inputControls.addControl(inputid, new FormControl('', Validators.required));
            }

            switch (input.type) {
              case 'string':
                inputElement.type = 'text';
                break;
              case 'boolean':
                inputElement.type = 'checkbox';
                break;
              case 'number':
                inputElement.type = 'number';
                break;
              case 'File':
                inputElement.type = 'file';
                break;
            }
            this.inputs.push(inputElement);
          });
        };
        reader.readAsText(fileToUpload);
    }
  }

  submit() {
    if (this.jobForm.valid) {
      this.uploadFiles().then(success => {
        this.submitJob();
      });
    }
  }

  uploadFiles(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const fi = this.fileInput.nativeElement;
      if (fi.files && fi.files[0]) {
        const fileToUpload = fi.files[0];
        const dirname = this.jobName;

        this.createDir(dirname).then(dirExists => {
          this.uploadFile('workflow', fi.files[0], dirname).then(success => {
            Promise.all(this.inputFileInput.map(element => {
              const native = element.nativeElement;
              if (native.files && native.files[0]) {
                return this.uploadFile(native.id, native.files[0], dirname);
              }
            })).then( () => {
              console.log('everything should be uploaded now.');
              resolve(true);
            });
          });
        });
      }
    });
  }

  createDir(dirname: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.webdav.get(`${URL}/${dirname}`).subscribe(
        (value) => {
          resolve(true);
        },
        (error) => {
          if (error.status === 404) {
            this.webdav.mkcol(`${URL}/${dirname}`).subscribe(
              (value) => {
                resolve(true);
              },
              (err2) => {
                reject(error);
              }
            );
          } else {
            reject(error);
          }
        }
      );
    });
  }

  uploadFile(id, file, dirname): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = readfile => {
        const contents: any = readfile.target;
        const body = contents.result;

        const header =  new Headers();
        header.append('Content-Type', 'application/octet-stream');
        this.webdav.put(`${URL}/${dirname}/${file.name}`, body, {headers: header})
          .subscribe(
            (value) => {
              this.files[id] = {
                id: id,
                path: dirname + '/' + file.name
              };
              console.log('Succesfully uploaded file: ' + file.name);
              resolve(true);
            },
            (error) => {
              console.log(error);
              reject(error);
            }
          );
      };
      reader.readAsArrayBuffer(file);
    });
  }

  submitJob() {
    const job: JobDescription = {
      name: this.jobName,
      workflow: this.files['workflow'].path,
      input: {
      }
    };

    const input = {};
    Object.keys(this.files).forEach(key => {
      if (key !== 'workflow') {
        input[key] = {
          class: 'File',
          path: this.files[key].path
        };
      }
    });
    Object.keys(this.inputControls.value).forEach(key => {
        input[key] = this.inputControls.value[key];
    });
    job.input = input;

    this.http.post(api, job).subscribe(
      (value) => {
        console.log('Submission made');
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
