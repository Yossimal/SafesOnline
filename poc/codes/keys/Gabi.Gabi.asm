mov ax, 65443
not ax
mov cx, 3
mul cx
mov [999], ax
for:
jmp for