import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DocumentoMatricula } from '../../models/documento-matricula.interface';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-documentos-cota-selector',
  templateUrl: './documentos-cota-selector.component.html',
  styleUrls: ['./documentos-cota-selector.component.scss'],
  standalone: false
})
export class DocumentosCotaSelectorComponent implements OnInit {
  @Input() documentosDisponiveis: DocumentoMatricula[] = [];
  @Input() documentosSelecionados: string[] = [];
  @Input() nomeCota: string = '';

  form!: FormGroup;

  constructor(private modalCtrl: ModalController, private fb: FormBuilder) {}

  ngOnInit() {
    const group: any = {};
    this.documentosDisponiveis.forEach((doc) => {
      group[doc.id] = [this.documentosSelecionados.includes(doc.id)];
    });
    this.form = this.fb.group(group);
  }

  confirmar() {
    const selecionados = Object.entries(this.form.value)
      .filter(([_, ativo]) => ativo)
      .map(([id]) => id);
    this.modalCtrl.dismiss(selecionados, 'confirmar');
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancelar');
  }
}
