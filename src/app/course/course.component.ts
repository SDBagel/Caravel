import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ConfigurationService } from '../core/services';
import { CourseService, UserService } from '../core/services/canvas';
import { Course, ExternalTool, Page, PlannerItem, Submission } from '../core/schemas';

import { RoundDatePipe } from 'app/core/pipes/round-date/round-date.pipe';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  // Determines if redesigned course home is used
  useRedesign = true;
  course: Course;
  recent: Submission[];
  stream: PlannerItem[];
  tools: ExternalTool[];

  // Front page if using legacy home page
  frontPage: Page;

  constructor(private configService: ConfigurationService,
              private courseService: CourseService,
              private userService: UserService,
              private route: ActivatedRoute,
              private roundDate: RoundDatePipe) {
    configService.config.subscribe({next: data => {
      this.useRedesign = <boolean>data["course"]["use_redesign"].value;
    }});
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.courseService.getCourse(params.id, course => this.course = course);
      this.courseService.listCourseRecentSubmissions(params.id, data => {
        this.recent = data.slice(0, 3);
      });

      // Get course stream (max 10 items or 7 days)
      let now = this.roundDate.transform(new Date());
      let loadTo = new Date(now.getTime() + 86400*1000*7);
      this.userService.getCoursePlanner(now, loadTo, `course_${params.id}`, data => {
        this.stream = data;
      });

      // Get course external tools
      this.courseService.listExternalTools(params.id, data => this.tools = data);

      // Course front page is used in legacy mode
      this.courseService.getCourseFrontPage(params.id, page => this.frontPage = page);
    });
  }

  // Synchronize config with settings here.
  syncConfig(val: boolean): void {
    this.configService.set("course", "use_redesign", val);
  }

  getSVGIconURL(name: string): string {
    const svgName = this.getSVGNameFromTool(name);
    return `assets/integrations/icons.svg#${svgName}`;
  }

  private getSVGNameFromTool(name: string): string {
    switch (name) {
      case "Flipgrid":
        return "flipgrid";
      case "GitHubClassroom":
        return "github";
      case "Google Drive":
        return "googledrive";
      case "Khan Academy":
        return "khanacademy";
      case "OneNote Class Notebook":
        return "onenote";
      default:
        return name.toLowerCase().replace(' ', '');
    }
  }

}
