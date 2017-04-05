$(document).ready(function(){
  $("#resume_gen").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "slideLeft",
    stepsOrientation: "vertical",
    autoFocus: true,
  });

  var resume = "";
  function generate_resume(){
    resume = `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Deedy - One Page Two Column Resume
% LaTeX Template
% Version 1.1 (30/4/2014)
%
% Original author:
% Debarghya Das (http://debarghyadas.com)
%
% Resumegen:
% WriteCodeEveryday(http://WriteCodeEveryday.github.io/)
% Original repository:
% https://github.com/deedydas/Deedy-Resume
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\documentclass[]{deedy-resume-openfont}


\\begin{document}
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
%     LAST UPDATED DATE
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
\\lastupdated

`;

    //Personal Section
    var name = $("#name").val();
    var website = $("#website").val();
    var email = $("#email").val();
    var phone = $("#phone").val();

    //console.log("Name: " + name)
    resume += "\\namesection{" + name.split(" ").join("}{") + "}{\n"
    if (website != ""){
      //console.log("Website: " + website)
      resume += "\\urlstyle{same}\\url{" + website + "} \\\\\n"
    }

    if (email != ""){
      //console.log("Email: " + email)
      resume += "\\href{mailto:" + email + "}{" + email + "} |\n"
    }

    if (phone != ""){
      //console.log("Phone: " + phone)
      resume += phone
    }
    resume += "}\n"

    resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
%     COLUMN ONE
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{minipage}[t]{0.33\\textwidth}

`;


    //Education Section
    var education = $(".education_form")
    if (education.length > 0){
      //Section exists
      resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     EDUCATION
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Education}

`;
      var schools = 0
      var degrees = 0
      $(education).children().each(function(i){
        var education_class = $(this).attr('class')
        if (education_class.indexOf('education_college_input') > 0) {
          if (schools > 0){
            resume += "\\sectionsep\n\n"
          }
          resume += "\\subsection{" + $(this).val() + "}\n"
          degrees = 0
          schools += 1
          //console.log("College: " + $(this).val());
        } else if (education_class.indexOf('education_degree_input') > 0) {
          if (degrees > 0){
            resume += "\\sectionsep\n\n"
          }
          resume += "\\descript{" + $(this).val() + "}\n"
          degrees += 1
          //console.log("Degree: " + $(this).val());
        } else if (education_class.indexOf('education_grad_date_loc_input') > 0) {
          resume += "\\location{" + $(this).val() +"}\n"
          //console.log("Date: " + $(this).val());
        } else if (education_class.indexOf('education_add_data_input') > 0 && $(this).val() != "") {
          //console.log("Additional Data: " + $(this).val().split("\n"));
          resume += "\\location{" + $(this).val().split("\n").join(" \\\\ ") + "}\n"
        }
      });
      resume += "\\sectionsep\n\n"
    }

    //Links section
    var links = $(".links_form")
    if (links.length > 0){
      //Section exists
      resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     LINKS
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Links}

`;
      $(links).children().each(function(i){
        var links_class = $(this).attr('class')
        if (links_class.indexOf('link_website_input') > 0) {
          //console.log("Website: " + $(this).val());
          resume += $(this).val() + ":// "
        } else if (links_class.indexOf('link_url_input') > 0) {
          //console.log("URL: " + $(this).val());
          resume += "\\href{" + $(this).val() +"}"
        } else if (links_class.indexOf('link_description_input') > 0) {
          //console.log("Description: " + $(this).val());
          resume += "{\\custombold{" + $(this).val() + "}} \\\\ \n"
        }
      });
      resume += "\\sectionsep\n\n"
    }

    //Coursework section
    var coursework = $(".coursework_form")
    if (coursework.length > 0){
      //Section exists
      resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     COURSEWORK
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Coursework}

`;
      $(coursework).children().each(function(i){
        var coursework_class = $(this).attr('class')
        if (coursework_class.indexOf('course_work_lvl_input') > 0) {
          //console.log("Level: " + $(this).val());
          resume += "\\subsection{" + $(this).val() + "}\n"
        } else if (coursework_class.indexOf('course_work_add_data_input') > 0) {
          //console.log("Additional Data: " + $(this).val().split("\n"));
          resume += $(this).val().split("\n").join("\\\\\n") + "\\\\\n\\sectionsep\n\n"
        }
      });
    }

    //Skills section
    var skills = $(".skills_form")
    if (skills.length > 0){
      //Section exists
      resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     SKILLS
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Skills}

`;
      $(skills).children().each(function(i){
        var skills_class = $(this).attr('class')
        if (skills_class.indexOf('skill_header_input') > 0) {
          //console.log("Header: " + $(this).val());
          resume += "\\subsection{" + $(this).val() + "}"
        } else if (skills_class.indexOf('skill_description_input') > 0 && $(this).val() != "") {
          //console.log("Description: " + $(this).val());
          resume += "\n\\location{" + $(this).val() + "}"
        } else if (skills_class.indexOf('skill_list_input') > 0) {
          //console.log("Skill List: " + $(this).val().split("\n"));
          resume += "\n";
          var array = $(this).val().split("\n")
          for (var i = 0; i < array.length ; i++){
            if (i % 3 == 0 && i != 0){
              resume += " \\\\\n" + array[i]
            } else if (i != 0) {
              resume += " \\textbullet{} " + array[i]
            } else {
              resume += array[i]
            }
          }
          resume += "\n\\sectionsep\n\n"

        }
      });
    }

    resume += `\n%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
%     COLUMN TWO
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\end{minipage}
\\hfill
\\begin{minipage}[t]{0.66\\textwidth}

`

    //Experience section
    var experience = $(".experience_form")
    var experience_history = 0
    if (experience.length > 0){
      //Section exists
      resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     EXPERIENCE
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Experience}

`
      $(experience).children().each(function(i){
        var experience_class = $(this).attr('class')
        if (experience_class.indexOf('experience_company') > 0) {
          //console.log("Company: " + $(this).val());
          resume += "\\runsubsection{" + $(this).val() + "}\n"
          experience_history += 1
        } else if (experience_class.indexOf('experience_title') > 0) {
          //console.log("Title: " + $(this).val());
          resume += "\\descript{| " + $(this).val() + " }\n"
        } else if (experience_class.indexOf('experience_date') > 0) {
          //console.log("Date: " + $(this).val());
          resume += "\\location{" + $(this).val() + " | "
        } else if (experience_class.indexOf('experience_location') > 0) {
          //console.log("Location: " + $(this).val());
          resume += $(this).val() + "}\n"
          if (experience_history == 1){
            resume += "\\vspace{\\topsep} % Hacky fix for awkward extra vertical space\n"
          }
        } else if (experience_class.indexOf('experience_remarks') > 0 && $(this).val() != "") {
          //console.log("Remarks: " + $(this).val().split("\n"));
          resume += "\\begin{tightemize}\n"
          resume += "\\item " + $(this).val().split("\n").join("\n\\item ") + "\n"
          resume += "\\end{tightemize}\n"
          resume += "\\sectionsep\n\n"
        }
      });
    }

    //Research section
    var research = $(".research_form")
    if (research.length > 0){
      //Section exists
      resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     RESEARCH
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Research}

`
      $(research).children().each(function(i){
        var research_class = $(this).attr('class')
        if (research_class.indexOf('research_university') > 0) {
          //console.log("University: " + $(this).val());
          resume += "\\runsubsection{" +  $(this).val() +"}\n"
        } else if (research_class.indexOf('research_title') > 0) {
          //console.log("Title: " + $(this).val());
          resume += "\\descript{| " +  $(this).val() + "}\n"
        } else if (research_class.indexOf('research_date') > 0) {
          //console.log("Date: " + $(this).val());
          resume += "\\location{" + $(this).val() + " | "
        } else if (research_class.indexOf('research_location') > 0) {
          //console.log("Location: " + $(this).val());
          resume += $(this).val() + "}\n"
        } else if (research_class.indexOf('research_remarks') > 0) {
          if ($(this).val() != ""){
            resume += $(this).val() + " \\\\ \n"
          }
          resume += "\\sectionsep\n\n"
          //console.log("Remarks: " + $(this).val().split("\n"));
        }
      });
    }

    //Awards section
    var awards = $(".awards_form")
    if (awards.length > 0){
      //Section exists
    resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     AWARDS
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Awards}
\\begin{tabular}{rll}

`
      $(awards).children().each(function(i){
        var awards_class = $(this).attr('class')
        if (awards_class.indexOf('awards_year') > 0) {
          //console.log("Year: " + $(this).val());
          resume += $(this).val() + " "
        } else if (awards_class.indexOf('awards_level') > 0) {
          //console.log("Level: " + $(this).val());
          resume += "& " + $(this).val() + " "
        } else if (awards_class.indexOf('awards_details') > 0) {
          //console.log("Details: " + $(this).val());
          resume += "& " + $(this).val() + "\\\\ \n"
        }
      });
      resume += `\\end{tabular}
\\sectionsep

`
    }

    //Societies section
    var societies = $(".societies_form")
    if (societies.length > 0){
      //Section exists
      resume += `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%     Societies
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\section{Societies}
\\begin{tabular}{rll}

`
      $(societies).children().each(function(i){
        var societies_class = $(this).attr('class')
        if (societies_class.indexOf('societies_year') > 0) {
          //console.log("Year: " + $(this).val());
          resume += $(this).val() + " "
        } else if (societies_class.indexOf('societies_level') > 0) {
          //console.log("Level: " + $(this).val());
          resume += "& " + $(this).val() + " "
        } else if (societies_class.indexOf('societies_details') > 0) {
          //console.log("Details: " + $(this).val());
          resume += "& " + $(this).val() + "\\\\ \n"
        }
      });
      resume += `\\end{tabular}
\\sectionsep

`
    }

    resume += `\\end{minipage}
\\end{document}  \\documentclass[]{article}`


    console.log("In Case Of An Error, The Following Is Your RESUME")
    console.log("%%%%%%%%%%%RESUME_START%%%%%%%%%%%\n")
    console.log(resume)
    console.log("%%%%%%%%%%%RESUME_END%%%%%%%%%%%\n")

    //Store this into the clipboard button
    $("#copy_resume").attr('data-clipboard-text', resume)
    new Clipboard('#copy_resume');
  }

  $('body').on('input', 'input', function(){
    generate_resume();
  });

  $('body').on('input', 'textarea', function(){
    generate_resume();
  });

  $('body').on('click', 'a.btn', function(){
    generate_resume();
  });

  // Add Education Button
  $("#add_education").on('click', function(){
    $("#education_section").append("<div class='education_form' style='margin-top: 10px'>"+
      "<input class='form-control education_college_input' placeholder='College'></input>"+
      "<input class='form-control education_degree_input' placeholder='Degree' style='margin-top: 5px'></input>"+
      "<input class='form-control education_grad_date_loc_input' placeholder='Graduation Date/Location (Optional)'></input>"+
      "<textarea class='form-control education_add_data_input' placeholder='Additional Data (Optional - One Per Line)'></textarea>"+
      "<a class='btn btn-success form-control education_add_degree' style='margin-top: 5px'>Add Degree</a>" +
    "</div>")
  });

  // Add Degree button under Education
  $("#education_section").on('click', 'a.education_add_degree', function(){
    $(this).before("<input class='form-control education_degree_input' placeholder='Degree' style='margin-top: 5px'></input>"+
      "<input class='form-control education_grad_date_loc_input' placeholder='Graduation Date/Location (Optional)'></input>"+
      "<textarea class='form-control education_add_data_input' placeholder='Additional Data (Optional - One Per Line)'></textarea>")
  });

  // Add Links button
  $("#add_links").on('click', function(){
    $("#links_section").append("<div class='links_form' style='margin-top: 10px'>"+
      "<input class='form-control link_website_input' placeholder='Website Name'></input>"+
      "<input class='form-control link_url_input' placeholder='URL'></input>"+
      "<input class='form-control link_description_input' placeholder='Description'></input>"+
    "</div>")
  });

  // Add Coursework button
  $("#add_coursework").on('click', function(){
    $("#coursework_section").append("<div class='coursework_form' style='margin-top: 10px'>"+
      "<input class='form-control course_work_lvl_input' placeholder='Level'></input>"+
      "<textarea class='form-control course_work_add_data_input' placeholder='Courses'></textarea>"+
    "</div>")
  });

  // Add Skills button
  $("#add_skills").on('click', function(){
    $("#skills_section").append("<div class='skills_form' style='margin-top: 10px'>"+
      "<input class='form-control skill_header_input' placeholder='Header'></input>"+
      "<input class='form-control skill_description_input' placeholder='Description (Optional)'></input>"+
      "<textarea class='form-control skill_list_input' placeholder='Skill List (One Per Line)'></textarea>"+
    "</div>")
  });

  // Add Research button
  $("#add_research").on('click', function(){
    $("#research_section").append("<div class='research_form' style='margin-top: 10px'>"+
      "<input class='form-control research_university' placeholder='University'></input>"+
      "<input class='form-control research_title' placeholder='Title'></input>"+
      "<input class='form-control research_date' placeholder='Date'></input>"+
      "<input class='form-control research_location' placeholder='Location'></input>"+
      "<textarea class='form-control research_remarks' placeholder='Remarks'></textarea>"+
    "</div>")
  });

  // Add Experience button
  $("#add_experience").on('click', function(){
    $("#experience_section").append("<div class='experience_form' style='margin-top: 10px'>"+
      "<input class='form-control experience_company' placeholder='Company'></input>"+
      "<input class='form-control experience_title' placeholder='Title'></input>"+
      "<input class='form-control experience_date' placeholder='Date'></input>"+
      "<input class='form-control experience_location' placeholder='Location'></input>"+
      "<textarea class='form-control experience_remarks' placeholder='Remarks (One Per Line)'></textarea>"+
    "</div>")
  });

  // Add Awards button
  $("#add_awards").on('click', function(){
    $("#awards_section").append("<div class='awards_form' style='margin-top: 10px'>"+
      "<input class='form-control awards_year' placeholder='Year'></input>"+
      "<input class='form-control awards_level' placeholder='Level'></input>"+
      "<input class='form-control awards_details' placeholder='Details'></input>"+
    "</div>")
  });

  // Add Societies button
  $("#add_societies").on('click', function(){
    $("#societies_section").append("<div class='societies_form' style='margin-top: 10px'>"+
    "<input class='form-control societies_year' placeholder='Year'></input>"+
    "<input class='form-control societies_level' placeholder='Level'></input>"+
    "<input class='form-control societies_details' placeholder='Details'></input>"+
    "</div>")
  });
});
